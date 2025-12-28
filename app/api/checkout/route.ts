import { NextResponse } from 'next/server'
import Stripe from 'stripe'

// IMPORTANT: Use Environment Variable in Production
const getStripe = () => {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) throw new Error('STRIPE_SECRET_KEY is missing')

    return new Stripe(key, {
        apiVersion: '2025-12-15.clover' as any,
        typescript: true,
    })
}

export async function POST(req: Request) {
    try {
        const stripe = getStripe()
        const body = await req.json()
        const { items, deliveryFee, zoneName, orderId, email } = body

        if (!items || items.length === 0) {
            return NextResponse.json({ error: 'No items in cart' }, { status: 400 })
        }

        const line_items = items.map((item: any) => ({
            price_data: {
                currency: 'aed',
                product_data: {
                    name: item.name,
                    // images: [item.image], // Optional, validation strictness varies
                },
                unit_amount: Math.round(parseFloat(item.price.replace(/[^0-9.]/g, '')) * 100), // Convert to fils
            },
            quantity: item.quantity,
        }))

        // Add Delivery Fee if applicable
        if (deliveryFee > 0) {
            line_items.push({
                price_data: {
                    currency: 'aed',
                    product_data: {
                        name: `Delivery Fee (${zoneName || 'Zone'})`,
                    },
                    unit_amount: Math.round(deliveryFee * 100),
                },
                quantity: 1,
            })
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items,
            mode: 'payment',
            client_reference_id: orderId, // Critical for Webhook to know which order was paid
            customer_email: email, // Pre-fill email
            success_url: `${req.headers.get('origin')}/?payment=success&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${req.headers.get('origin')}/?payment=cancelled`,
        })

        return NextResponse.json({ url: session.url })
    } catch (err: any) {
        console.error('Stripe Error:', err)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
