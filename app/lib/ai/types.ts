export interface ChatMessage {
    role: 'user' | 'assistant'
    content: string
}

export interface AIProvider {
    generateResponse(messages: ChatMessage[], context?: any): Promise<string>
}
