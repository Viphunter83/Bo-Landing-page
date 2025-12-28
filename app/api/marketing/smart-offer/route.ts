import { NextResponse } from 'next/server'
import { getAIClient } from '@/app/lib/ai/client'

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { profile } = body

        if (!profile) {
            return NextResponse.json({ error: 'Profile required' }, { status: 400 })
        }

        const systemPrompt = `
        You are a Marketing Specialist for "Bo Restaurant Dubai".
        Your goal is to write a HYPER-PERSONALIZED offer message for a specific customer based on their data.

        CUSTOMER DATA:
        - Name: ${profile.history?.orders?.[0]?.name || profile.history?.bookings?.[0]?.name || 'Guest'}
        - Segments: ${profile.segments?.join(', ') || 'New User'}
        - Total Spent: ${profile.stats?.totalSpent || 0} AED
        - Favorite Dish: ${profile.stats?.favoriteCategory || 'Unknown'}
        - Last Visit: ${profile.stats?.lastVisit ? new Date(profile.stats.lastVisit).toLocaleDateString() : 'Never'}

        TASK:
        Write a short, friendly, and tempting message (max 2 sentences) to bring them back.
        Include a relevant offer (e.g. 20% off, Free Drink) based on their value.
        
        TONE: Warm, Exclusive, Professional.
        Languages: English.
        `

        const ai = getAIClient('proxy')
        const response = await ai.generateResponse([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: "Generate the offer message." }
        ])

        return NextResponse.json({
            success: true,
            offer: response
        })

    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 })
    }
}
