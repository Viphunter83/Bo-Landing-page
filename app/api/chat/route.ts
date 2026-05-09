import { NextResponse } from 'next/server'
import { getAIClient } from '../../lib/ai/client'
import { buildSystemPrompt } from '../../lib/ai/prompt_builder'
import { getTenantConfig } from '../../lib/firebase/tenant'
import { getMenu } from '../../data/menuData'

export async function POST(req: Request) {
    try {
        const tenantId = req.headers.get('x-tenant-id') || process.env.NEXT_PUBLIC_TENANT_ID || 'bo_dubai'
        const tenantConfig = await getTenantConfig(tenantId)
        
        if (!tenantConfig) {
            return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
        }

        const menu = getMenu(tenantId)

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
        const systemPrompt = buildSystemPrompt(context || {}, menu, tenantConfig)
        const fullMessages = [
            { role: 'system', content: systemPrompt },
            ...messages
        ]

        const response = await ai.generateResponse(fullMessages, { ...context, menu })

        return NextResponse.json({ role: 'assistant', content: response })
    } catch (error) {
        console.error('AI Route Error:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to process request' },
            { status: 500 }
        )
    }
}
