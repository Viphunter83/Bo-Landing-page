import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { adminAuth, adminDb } from '@/app/lib/firebase-admin'

export async function POST(request: Request) {
    try {
        const { initData } = await request.json()

        if (!initData) {
            return NextResponse.json({ error: 'No data provided' }, { status: 400 })
        }

        // 1. Validation Logic
        const urlParams = new URLSearchParams(initData)
        const hash = urlParams.get('hash')
        urlParams.delete('hash')

        // Sort keys alphabetically
        const dataCheckString = Array.from(urlParams.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, value]) => `${key}=${value}`)
            .join('\n')

        // Create Secret Key
        const secretKey = crypto
            .createHmac('sha256', 'WebAppData')
            .update(process.env.TELEGRAM_BOT_TOKEN!)
            .digest()

        // Calculate Hash
        const calculatedHash = crypto
            .createHmac('sha256', secretKey)
            .update(dataCheckString)
            .digest('hex')

        if (calculatedHash !== hash) {
            console.error('Hash mismatch', { calculatedHash, hash }) // Debugging
            return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })
        }

        // 2. Extract User Data
        const userStr = urlParams.get('user')
        if (!userStr) throw new Error('No user data found')

        const telegramUser = JSON.parse(userStr)
        const uid = `telegram:${telegramUser.id}`

        // 3. Sync to Firestore (CRM)
        const userRef = adminDb.collection('users').doc(uid)
        await userRef.set({
            telegramId: telegramUser.id,
            firstName: telegramUser.first_name || '',
            lastName: telegramUser.last_name || '',
            username: telegramUser.username || '',
            photoUrl: telegramUser.photo_url || '',
            languageCode: telegramUser.language_code || 'en',
            lastLogin: new Date(),
            authProvider: 'telegram',
            isPremium: telegramUser.is_premium || false
        }, { merge: true })

        // 4. Update Custom Token
        const customToken = await adminAuth.createCustomToken(uid, {
            telegram: true,
            username: telegramUser.username
        })

        return NextResponse.json({ token: customToken })

    } catch (error: any) {
        console.error('Auth Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
