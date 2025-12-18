import { AIProvider } from './types'
import { MockAIProvider } from './mockProvider'

// In the future, we can add 'gemini' here
type ProviderType = 'mock' | 'gemini'

export function getAIClient(type: ProviderType = 'mock'): AIProvider {
    switch (type) {
        case 'mock':
            return new MockAIProvider()
        default:
            return new MockAIProvider() // Default to mock for safety
    }
}
