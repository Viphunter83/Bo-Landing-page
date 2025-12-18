import { NextResponse } from 'next/server'
import { getAIClient } from '../../lib/ai/client'

export async function POST(req: Request) {
    try {
        const { messages } = await req.json()

        // In the future, we can toggle this based on ENV
        const ai = getAIClient('mock')

        const response = await ai.generateResponse(messages)

        return NextResponse.json({ role: 'assistant', content: response })
    } catch (error) {
        console.error('AI Error:', error)
        return NextResponse.json(
            { error: 'Failed to process request' },
            { status: 500 }
        )
    }
}
