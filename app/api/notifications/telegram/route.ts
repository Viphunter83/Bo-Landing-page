
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const {
            name, phone, date, time, guests, specialRequests,
            type = 'dine_in',
            address,
            items,
            paymentMethod,
            source = 'web'
        } = await request.json();

        // Defaults for immediate orders
        const displayDate = date || new Date().toLocaleDateString('en-GB');
        const displayTime = time || new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

        const token = process.env.TELEGRAM_BOT_TOKEN;
        const chatId = process.env.TELEGRAM_CHAT_ID;

        if (!token || !chatId) {
            console.error('Telegram credentials missing');
            return NextResponse.json({ error: 'Configuration error' }, { status: 500 });
        }

        // 1. Determine Header based on Type
        let header = '🍽️ *New Table Booking!*';
        if (type === 'delivery') header = '🛵 *New Delivery Order!*';
        if (type === 'pickup') header = '🛍️ *New Pickup Order!*';

        // 2. Format Address (Google Maps Link)
        let locationSection = '';
        if (type === 'delivery' && address) {
            const encodedAddress = encodeURIComponent(address);
            locationSection = `📍 *Address:* [${address}](https://www.google.com/maps/search/?api=1&query=${encodedAddress})\n`;
        }

        // 3. Format Items
        let itemsSection = '';
        if (items) {
            itemsSection = `📦 *Order:* \n${items}\n`;
        }

        // 4. Payment Method
        let paymentSection = '';
        if (paymentMethod) {
            const methodMap: Record<string, string> = {
                card: '💳 Card (on delivery)',
                cash: '💵 Cash',
                online: '🔗 Online Link Request'
            };
            paymentSection = `💰 *Payment:* ${methodMap[paymentMethod] || paymentMethod}\n`;
        }

        // 4. Source Badge
        const sourceBadge = source === 'manual' ? '🛠️ *Admin Created*' : '🌐 *Web Booking*';

        const message = `
${header}

👤 *Name:* ${name}
📞 *Phone:* ${phone}
📅 *Date:* ${displayDate}
⏰ *Time:* ${displayTime}
${guests ? `👥 *Guests:* ${guests}` : ''}
${locationSection}
${itemsSection}
${paymentSection}
${specialRequests ? `📝 *Note:* ${specialRequests}` : ''}

${sourceBadge}
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
                disable_web_page_preview: true
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
