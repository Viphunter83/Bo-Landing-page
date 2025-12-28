import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getAdminDb } from '../../../lib/firebase-admin'

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY!
if (!STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY is missing')

const stripe = new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: '2025-12-15.clover' as any,
    typescript: true
})

export async function POST(req: Request) {
    const body = await req.text()
    const sig = req.headers.get('stripe-signature') as string
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

    let event: Stripe.Event

    try {
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
            // 1. Update Firestore using Admin SDK
            try {
                await getAdminDb().collection('orders').doc(orderId).update({
                    paymentStatus: 'paid',
                    status: 'new', // Move to active queue
                    stripeSessionId: session.id,
                    paidAt: new Date()
                })
                console.log(`Updated Order ${orderId} to PAID`)
            } catch (dbError) {
                console.error('Firestore Update Error:', dbError)
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
