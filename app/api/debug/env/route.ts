import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
    return NextResponse.json({
        env_check: {
            FIREBASE_PROJECT_ID: !!process.env.FIREBASE_PROJECT_ID,
            FIREBASE_CLIENT_EMAIL: !!process.env.FIREBASE_CLIENT_EMAIL,
            FIREBASE_PRIVATE_KEY: !!process.env.FIREBASE_PRIVATE_KEY ? 'EXISTS (Length: ' + process.env.FIREBASE_PRIVATE_KEY.length + ')' : 'MISSING',
            NODE_ENV: process.env.NODE_ENV,
            VERCEL: process.env.VERCEL
        },
        timestamp: new Date().toISOString()
    })
}
