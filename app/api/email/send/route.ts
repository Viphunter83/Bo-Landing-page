import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { EmailTemplates } from '../../../lib/email/templates'
import { getTenantConfig } from '../../../lib/firebase/tenant'

export async function POST(req: Request) {
    try {
        const apiKey = process.env.RESEND_API_KEY
        if (!apiKey) {
            console.error('RESEND_API_KEY is missing')
            return NextResponse.json({ success: false, error: 'Server configuration error: Missing Email API Key' }, { status: 500 })
        }
        const resend = new Resend(apiKey)

        const { type, data, to, subject, tenantId } = await req.json()

        if (!to) {
            return NextResponse.json({ success: false, error: 'Missing recipient email' }, { status: 400 })
        }

        if (!tenantId) {
            return NextResponse.json({ success: false, error: 'Missing tenant ID' }, { status: 400 })
        }

        const config = await getTenantConfig(tenantId)
        if (!config) {
            return NextResponse.json({ success: false, error: 'Tenant configuration not found' }, { status: 404 })
        }

        let html = ''

        if (type === 'order') {
            html = EmailTemplates.orderConfirmation(data, config)
        } else if (type === 'booking') {
            html = EmailTemplates.bookingConfirmation(data, config)
        } else if (type === 'marketing') {
            html = EmailTemplates.marketingPromo(data.segment, config)
        } else if (type === 'quiz_coupon') {
            html = EmailTemplates.quizCoupon(data.code, config)
        } else {
            return NextResponse.json({ success: false, error: 'Invalid email type' }, { status: 400 })
        }

        const dataRes = await resend.emails.send({
            from: `${config.brand.name} <onboarding@resend.dev>`,
            to: [to],
            subject: subject || `Notification from ${config.brand.name}`,
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

