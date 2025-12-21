import { NextResponse } from 'next/server'
import { getAIClient } from '../../lib/ai/client'
import { buildSystemPrompt } from '../../lib/ai/prompt_builder'

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { messages, context } = body

        if (!messages || !Array.isArray(messages)) {
            console.error('Invalid messages format:', messages)
            return NextResponse.json(
                { error: 'Messages array is required' },
                { status: 400 }
            )
        }

        // In the future, we can toggle this based on ENV
        const ai = getAIClient('proxy') // Using 'proxy' as default now

        // Agentic AI: Inject System Prompt
        const systemPrompt = buildSystemPrompt(context || {})
        const fullMessages = [
            { role: 'system', content: systemPrompt },
            ...messages
        ]

        const response = await ai.generateResponse(fullMessages, context)

        return NextResponse.json({ role: 'assistant', content: response })
    } catch (error) {
        console.error('AI Route Error:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to process request' },
            { status: 500 }
        )
    }
}
