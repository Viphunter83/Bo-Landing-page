import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getAdminDb } from '../../../lib/firebase-admin'
import { deductStockForOrderAdmin } from '../../../lib/inventory-admin'

const getStripe = () => {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) throw new Error('STRIPE_SECRET_KEY is missing')

    return new Stripe(key, {
        apiVersion: '2025-12-15.clover' as any,
        typescript: true
    })
}

export async function POST(req: Request) {
    const body = await req.text()
    const sig = req.headers.get('stripe-signature') as string
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

    let event: Stripe.Event

    try {
        const stripe = getStripe()
        if (endpointSecret) {
            event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
        } else {
            // DANGEROUS: Only for dev without strict signature
            event = JSON.parse(body) as Stripe.Event
        }
    } catch (err: any) {
        console.error(`Webhook Error: ${err.message}`)
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session
        const orderId = session.client_reference_id
        const email = session.customer_email

        console.log(`Payment success for Order ${orderId}`)

        if (orderId) {
            const db = getAdminDb()
            const orderRef = db.collection('orders').doc(orderId)

            // 1. Idempotency Check & Transaction
            // We fetch first to ensure we don't process twice
            const orderDoc = await orderRef.get()

            if (!orderDoc.exists) {
                console.error(`Order ${orderId} not found`)
                return NextResponse.json({ error: 'Order not found' }, { status: 404 })
            }

            const orderData = orderDoc.data()
            if (orderData?.paymentStatus === 'paid') {
                console.log(`Order ${orderId} already paid. Skipping webhook processing.`)
                return NextResponse.json({ received: true, status: 'already_processed' })
            }

            // 2. Update Status to PAID
            try {
                await orderRef.update({
                    paymentStatus: 'paid',
                    status: 'new',
                    stripeSessionId: session.id,
                    paidAt: new Date()
                })
                console.log(`Updated Order ${orderId} to PAID`)
            } catch (dbError) {
                console.error('Firestore Update Error:', dbError)
                return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
            }

            // 3. Trigger Inventory Deduction (Only if successful update)
            try {
                if (orderData?.items) {
                    await deductStockForOrderAdmin(orderId, orderData.items)
                }
            } catch (invError) {
                console.error('Inventory Deduction Error:', invError)
            }

            // 4. Referral Reward Logic
            try {
                if (orderData?.promoCode) {
                    const couponsSnap = await db.collection('coupons').where('code', '==', orderData.promoCode).limit(1).get()
                    if (!couponsSnap.empty) {
                        const coupon = couponsSnap.docs[0].data()
                        if (coupon.source === 'referral' && coupon.userId) {
                            // Verify if it's the first order for this customer (Referee)
                            // We query orders by email or phone
                            const identifier = orderData.email || orderData.customerPhone
                            if (identifier) {
                                // Simple check: Count paid orders
                                const pastOrders = await db.collection('orders')
                                    .where('paymentStatus', '==', 'paid')
                                    .where(orderData.email ? 'email' : 'customerPhone', '==', identifier)
                                    .count()
                                    .get()

                                // If count is 1 (this order is the first paid one), reward referrer
                                if (pastOrders.data().count === 1) {
                                    const { rewardReferrerAdmin } = require('../../../lib/referral-admin')
                                    await rewardReferrerAdmin(coupon.userId, 50) // 50 AED Reward
                                    console.log(`[Referral] Rewarded ${coupon.userId} for new customer ${identifier}`)
                                } else {
                                    console.log(`[Referral] Skipped reward - customer ${identifier} is not new.`)
                                }
                            }
                        }
                    }
                }
            } catch (refError) {
                console.error('Referral Reward Error:', refError)
            }

            // 2. Call Notifications (Telegram + Email)
            // Telegram
            await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/notifications/telegram`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: session.customer_details?.name || 'Online Customer',
                    phone: 'Stripe Payment',
                    items: `Order #${orderId} Paid via Stripe`,
                    paymentMethod: 'card',
                    type: 'delivery',
                    source: 'stripe',
                    total: (session.amount_total || 0) / 100 + ' AED'
                })
            }).catch(console.error)

            // Send Email
            if (email) {
                await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/email/send`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'order',
                        to: email,
                        subject: 'Payment Receipt - Bo Dubai',
                        data: {
                            total: (session.amount_total || 0) / 100 + ' AED',
                            items: [{ name: `Order #${orderId}`, price: '', quantity: 1 }]
                        }
                    })
                }).catch(console.error)
            }
        }
    }

    return NextResponse.json({ received: true })
}
