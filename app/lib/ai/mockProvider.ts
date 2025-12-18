import { AIProvider, ChatMessage } from './types'
import { fullMenu } from '../../data/menuData'

export class MockAIProvider implements AIProvider {
    async generateResponse(messages: ChatMessage[], context?: any): Promise<string> {
        const lastMessage = messages[messages.length - 1].content.toLowerCase()

        // Simulate network delay for realism
        await new Promise(resolve => setTimeout(resolve, 800))

        // 1. Check for specific menu items requests
        const matchedDish = fullMenu.find(dish =>
            lastMessage.includes(dish.name.toLowerCase()) ||
            lastMessage.includes(dish.nameRu.toLowerCase()) ||
            (dish.tag && lastMessage.includes(dish.tag.toLowerCase()))
        )

        if (matchedDish) {
            return `Ah, good choice! ** ${matchedDish.name}** (${matchedDish.price}). It's really popular. ${matchedDish.desc} Would you like to reserve a table?`
        }

        // 2. Existing Keywords Logic
        if (lastMessage.includes('hello') || lastMessage.includes('hi') || lastMessage.includes('привет')) {
            return "Hello! I'm Bo, your AI waiter. How can I help you navigate our menu today? 🍜"
        }

        if (lastMessage.includes('spicy') || lastMessage.includes('острое')) {
            return "Ooh, feeling brave? 🔥 I highly recommend the **Spicy Bun Bo Hue**. It's got that perfect kick of lemongrass and chili. Would you like to see it?"
        }

        if (lastMessage.includes('vegan') || lastMessage.includes('vegetarian')) {
            return "Excellent choice! We have a fantastic **Vegan Pho** made with mushroom broth that's just as rich as the original. Also, our **Fresh Spring Rolls** are a must-try! 🌿"
        }

        if (lastMessage.includes('drink') || lastMessage.includes('napitok')) {
            return "Thirsty? Our **Mango Shake** is legendary in Dubai. Or if you want something traditional, try the **Vietnamese Iced Coffee** (Ca Phe Sua Da). 🥭☕"
        }

        if (lastMessage.includes('surprise') || lastMessage.includes('recommend')) {
            return "Let's play it safe but delicious. You can't go wrong with our **Classic Pho Bo**. It's the dish that made us famous! Simmered for 12 hours. 🥣"
        }

        return "I'm still learning specifically about that, but I can tell you everything about our Pho, Banh Mi, and special drinks! What are you in the mood for?"
    }
}
