import { NextResponse } from 'next/server'
import { getOrCreateReferralCodeAdmin } from '@/app/lib/referral-admin'

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { userId, name } = body

        if (!userId) {
            return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
        }

        const code = await getOrCreateReferralCodeAdmin(userId, name || 'Friend')

        return NextResponse.json({ code })

    } catch (e: any) {
        console.error('Referral Generation Error:', e)
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
