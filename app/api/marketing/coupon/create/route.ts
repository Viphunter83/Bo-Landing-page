import { NextResponse } from 'next/server'
import { createCoupon } from '@/app/lib/coupons'

export async function POST(req: Request) {
    try {
        // Authenticate admin here in real world
        const body = await req.json()

        // Default to discount_percentage if not provided
        const coupon = await createCoupon({
            type: body.type || 'discount_percentage',
            value: body.value || 20,
            userId: body.userId,
            expiryDays: body.expiryDays || 7
        })

        return NextResponse.json({ success: true, coupon })

    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 })
    }
}
