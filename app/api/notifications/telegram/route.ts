
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { name, phone, date, time, guests, specialRequests } = await request.json();

        const token = process.env.TELEGRAM_BOT_TOKEN;
        const chatId = process.env.TELEGRAM_CHAT_ID;

        if (!token || !chatId) {
            console.error('Telegram credentials missing');
            return NextResponse.json({ error: 'Configuration error' }, { status: 500 });
        }

        const message = `
🔥 *New Booking!*

👤 *Name:* ${name}
📞 *Phone:* ${phone}
📅 *Date:* ${date}
⏰ *Time:* ${time}
👥 *Guests:* ${guests}
${specialRequests ? `📝 *Note:* ${specialRequests}` : ''}

_Sent from Bo OS_
    `.trim();

        const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'Markdown',
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Telegram API Error:', errorData);
            return NextResponse.json({ error: 'Failed to send to Telegram' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Notification Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
