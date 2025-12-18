import { AIProvider, ChatMessage } from './types'
import { fullMenu } from '../../data/menuData'

export class ProxyAIProvider implements AIProvider {
    private apiKey: string

    constructor() {
        this.apiKey = process.env.PROXY_API_KEY || ''
    }

    async generateResponse(messages: ChatMessage[], context?: any): Promise<string> {
        if (!this.apiKey) {
            console.error('PROXY_API_KEY is missing')
            return "I'm having trouble connecting to my brain right now. Please tell the administrator to check my API key! 🤖"
        }

        // 1. Build System Prompt with Menu Context
        const menuContext = fullMenu.map(d => `${d.name} (${d.price}): ${d.desc}`).join('\n')

        const systemPrompt = `
      You are Bo, a friendly and sophisticated AI waiter at a high-end Vietnamese restaurant in Dubai (Festival City).
      
      Your Goal: Help guests choose dishes, explain the menu, and share the "vibe" of Vietnam.
      
      Menu Knowledge:
      ${menuContext}
      
      Rules:
      1. Be polite, warm, and professional.
      2. If asked about prices, use AED.
      3. Recommend specific dishes from the menu above.
      4. Keep answers concise (under 3 sentences) unless asked for details.
      5. If you don't know something, suggest asking a human staff member.
      6. Do not mention your underlying AI model (GPT, Gemini, etc). You are Bo.
    `

        const apiMessages = [
            { role: 'system', content: systemPrompt },
            ...messages
        ]

        try {
            const response = await fetch('https://api.proxyapi.ru/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini', // Cost-effective and fast
                    messages: apiMessages,
                    max_tokens: 300,
                    temperature: 0.7
                })
            })

            if (!response.ok) {
                throw new Error(`ProxyAPI Error: ${response.status} ${response.statusText}`)
            }

            const data = await response.json()
            return data.choices[0].message.content
        } catch (error) {
            console.error('ProxyAI Error:', error)
            return "I'm a bit overwhelmed right now. Can you repeat that?"
        }
    }
}
