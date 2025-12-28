import { NextResponse } from 'next/server'
import { redeemCoupon } from '@/app/lib/coupons'

export async function POST(req: Request) {
    try {
        const { couponId } = await req.json()

        if (!couponId) {
            return NextResponse.json({ error: 'ID required' }, { status: 400 })
        }

        await redeemCoupon(couponId)

        return NextResponse.json({ success: true })

    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 })
    }
}
