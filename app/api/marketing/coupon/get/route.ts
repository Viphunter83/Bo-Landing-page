import { NextResponse } from 'next/server'
import { getCouponByCode } from '@/app/lib/coupons'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const code = searchParams.get('code')

    if (!code) return NextResponse.json({ error: 'Code required' }, { status: 400 })

    try {
        const coupon = await getCouponByCode(code)

        if (!coupon) {
            return NextResponse.json({ success: false, error: 'Not found' })
        }

        return NextResponse.json({ success: true, coupon })
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 })
    }
}
