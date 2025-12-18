import { AIProvider } from './types'
import { MockAIProvider } from './mockProvider'
import { ProxyAIProvider } from './proxyProvider'

// In the future, we can add 'gemini' here
type ProviderType = 'mock' | 'proxy'

export function getAIClient(type: ProviderType = 'proxy'): AIProvider {
    switch (type) {
        case 'mock':
            return new MockAIProvider()
        case 'proxy':
            return new ProxyAIProvider()
        default:
            return new ProxyAIProvider()
    }
}

