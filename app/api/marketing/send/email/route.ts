
import { NextResponse } from 'next/server'
import { resend, EMAIL_FROM } from '../../../../lib/resend'
import { generateBoEmailHtml } from '../../../../lib/email-templates'

export async function POST(request: Request) {
    try {
        const { email, message, subject } = await request.json()

        if (!email || !message) {
            return NextResponse.json({ success: false, error: 'Email and message are required' }, { status: 400 })
        }

        // Simple subject fallback
        const emailSubject = subject || 'A Special Offer from Bo Restaurant 🎁'

        // Use the email prefix as a placeholder username if we don't have the real name handy here
        // Ideally pass 'name' in body too
        const username = email.split('@')[0]

        const html = generateBoEmailHtml(username, message)

        const { data, error } = await resend.emails.send({
            from: EMAIL_FROM,
            to: email, // 'delivered@resend.dev' for testing if domain not verified
            subject: emailSubject,
            html: html,
        })

        if (error) {
            console.error('Resend Error:', error)
            return NextResponse.json({ success: false, error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true, data })

    } catch (e) {
        console.error(e)
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
    }
}
