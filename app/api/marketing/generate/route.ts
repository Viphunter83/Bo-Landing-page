import { NextResponse } from 'next/server'
import { getAIClient } from '../../../lib/ai/client'
import { fullMenu, MenuItem } from '../../../data/menuData'

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { platform, topic, tone, lang } = body

        if (!platform || !topic) {
            return NextResponse.json(
                { error: 'Platform and Topic are required' },
                { status: 400 }
            )
        }

        // 1. Find Context (Menu Item)
        // Check if 'topic' matches a menu item ID or Name
        const menuItem = fullMenu.find(i => i.id === topic || i.name === topic)

        let contextInfo = ""
        if (menuItem) {
            contextInfo = `
            DISH DETAILS:
            - Name: ${menuItem.name}
            - Price: ${menuItem.price}
            - Description: ${menuItem.desc}
            - Ingredients: ${menuItem.ingredients?.join(', ')}
            `
        } else {
            contextInfo = `TOPIC: ${topic} (General Vibe/News)`
        }

        // 2. Build Prompt
        const systemPrompt = `
        You are an expert Social Media Manager for "Bo Restaurant Dubai" (Vietnamese Cuisine, Premium, Modern).
        
        GOAL: Write a viral ${platform} post.
        TONE: ${tone || 'Excited'}
        LANGUAGE: ${lang || 'en'} (If 'ru', write in Russian. If 'ar', write in Arabic).

        CONTEXT:
        ${contextInfo}

        RULES:
        1. Start with a hook (Question or Bold Statement).
        2. Include the Price if it's a specific dish.
        3. Use line breaks for readability.
        4. End with a Call to Action (e.g., "Book via link in bio").
        5. Add 5-7 relevant hashtags (must include #BoDubai #DubaiFood).
        `

        const ai = getAIClient('proxy')
        const response = await ai.generateResponse([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Write a post for ${platform} about ${menuItem ? menuItem.name : topic}.` }
        ])

        return NextResponse.json({
            success: true,
            content: response
        })

    } catch (e: any) {
        console.error('Marketing Gen Error:', e)
        return NextResponse.json({ success: false, error: e.message }, { status: 500 })
    }
}
