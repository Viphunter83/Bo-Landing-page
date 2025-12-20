import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { EmailTemplates } from '../../../lib/email/templates'


// Initialize safely inside handler or check existence


export async function POST(req: Request) {
    try {
        const apiKey = process.env.RESEND_API_KEY
        if (!apiKey) {
            console.error('RESEND_API_KEY is missing')
            return NextResponse.json({ success: false, error: 'Server configuration error: Missing Email API Key' }, { status: 500 })
        }
        const resend = new Resend(apiKey)

        const { type, data, to, subject } = await req.json()

        if (!to) {
            return NextResponse.json({ success: false, error: 'Missing recipient email' }, { status: 400 })
        }

        let html = ''

        if (type === 'order') {
            html = EmailTemplates.orderConfirmation(data)
        } else if (type === 'booking') {
            html = EmailTemplates.bookingConfirmation(data)
        } else if (type === 'marketing') {
            html = EmailTemplates.marketingPromo(data.segment)
        } else if (type === 'quiz_coupon') {
            html = EmailTemplates.quizCoupon(data.code)
        } else {
            return NextResponse.json({ success: false, error: 'Invalid email type' }, { status: 400 })
        }

        const dataRes = await resend.emails.send({
            from: 'Bo Restaurant <onboarding@resend.dev>', // Update this with your verified domain later
            to: [to], // For testing, Resend only allows sending to your own email if domain not verified
            subject: subject || 'Notification from Bo',
            html: html,
        })

        if (dataRes.error) {
            console.error('Resend Error:', dataRes.error)
            return NextResponse.json({ success: false, error: dataRes.error }, { status: 500 })
        }

        return NextResponse.json({ success: true, data: dataRes })
    } catch (error) {
        console.error('Email API Error:', error)
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
    }
}
