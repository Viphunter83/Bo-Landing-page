import { NextResponse } from 'next/server'
import { getAIClient } from '../../lib/ai/client'

export async function POST(req: Request) {
    try {
        const { messages, context } = await req.json()

        // In the future, we can toggle this based on ENV
        const ai = getAIClient('proxy') // Using 'proxy' as default now

        const response = await ai.generateResponse(messages, context)

        return NextResponse.json({ role: 'assistant', content: response })
    } catch (error) {
        console.error('AI Error:', error)
        return NextResponse.json(
            { error: 'Failed to process request' },
            { status: 500 }
        )
    }
}
