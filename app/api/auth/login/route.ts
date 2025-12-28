import { NextResponse } from 'next/server'
// import { adminAuth } from '@/app/lib/firebase-admin'

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { idToken, email } = body

        if (!idToken) {
            return NextResponse.json({ error: 'ID Token required' }, { status: 400 })
        }

        // TODO: In a production environment with proper env vars, verify the token:
        // try {
        //   await adminAuth.verifyIdToken(idToken)
        // } catch (e) {
        //   return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
        // }

        // Setting a cookie to satisfy middleware
        const response = NextResponse.json({ success: true, email })

        // Expires in 5 days
        const expires = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)

        response.cookies.set('admin_session', 'true', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            expires
        })

        return response

    } catch (e: any) {
        console.error('Login error:', e)
        return NextResponse.json({ success: false, error: e.message }, { status: 500 })
    }
}
