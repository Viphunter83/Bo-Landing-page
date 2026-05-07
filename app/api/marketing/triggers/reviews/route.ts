import { NextResponse } from 'next/server'
import { getTenantCollection } from '@/app/lib/db/tenant_db'
import { query, getDocs, orderBy, limit } from 'firebase/firestore'
import { resend } from '@/app/lib/resend'
import { generateBoEmailHtml } from '@/app/lib/email-templates'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
    try {
        // 1. Find recent completed orders (last 48 hours for demo purposes)
        const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000)

        const q = query(
            getTenantCollection('orders'),
            orderBy('createdAt', 'desc'),
            limit(20) // Limit to avoid massive blasts during test
        )

        const snapshot = await getDocs(q)
        const targets: any[] = []

        snapshot.forEach(doc => {
            const data = doc.data()
            const created = data.createdAt?.seconds ? new Date(data.createdAt.seconds * 1000) : null

            // Filter: Completed AND Recent AND Has Email
            if (data.status === 'completed' && created && created > fortyEightHoursAgo) {
                if (data.email && data.email.includes('@')) {
                    // Avoid duplicates if user ordered twice
                    if (!targets.find(t => t.email === data.email)) {
                        targets.push({ id: doc.id, ...data })
                    }
                }
            }
        })

        // 2. Send Emails
        let sentCount = 0
        const results = []

        if (process.env.RESEND_API_KEY) {
            for (const target of targets) {
                const messageBody = `
                    We hope you enjoyed your recent meal at Bo 🍜
                    <br><br>
                    We would love to verify if everything was perfect. Could you leave us a quick review to help others find us?
                    <br><br>
                    <div style="text-align: center;">
                        <a href="https://google.com/maps" style="background-color: #fff; color: #000; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Rate Us on Google</a>
                    </div>
                `

                const subject = "How was the spicy broth? 🌶️"

                try {
                    await resend.emails.send({
                        from: 'Bo Restaurant <onboarding@resend.dev>',
                        to: target.email,
                        subject: subject,
                        html: generateBoEmailHtml(target.name || 'Guest', messageBody)
                    })
                    sentCount++
                    results.push(`Sent to ${target.email}`)
                } catch (error) {
                    console.error(`Failed to send to ${target.email}`, error)
                    results.push(`Failed: ${target.email}`)
                }
            }
        } else {
            return NextResponse.json({ success: false, message: 'RESEND_API_KEY missing' })
        }

        return NextResponse.json({
            success: true,
            message: sentCount > 0 ? `Sent review requests to ${sentCount} guests!` : `No eligible orders found in last 48h.`,
            details: results
        })

    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 })
    }
}

