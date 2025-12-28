import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    try {
        const { chatId, message } = await req.json()

        if (!chatId || !message) {
            return NextResponse.json({ error: 'Missing chatId or message' }, { status: 400 })
        }

        const token = process.env.TELEGRAM_BOT_TOKEN
        if (!token) {
            return NextResponse.json({ error: 'Telegram Token disallowed' }, { status: 500 })
        }

        const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'Markdown', // or 'HTML'
            }),
        })

        const data = await response.json()

        if (!data.ok) {
            console.error('Telegram Send Error:', data)
            return NextResponse.json({ success: false, error: data.description }, { status: 400 })
        }

        return NextResponse.json({ success: true, data: data.result })

    } catch (e: any) {
        console.error('Telegram API Error:', e)
        return NextResponse.json({ success: false, error: e.message }, { status: 500 })
    }
}
