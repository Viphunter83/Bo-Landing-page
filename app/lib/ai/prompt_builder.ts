import { fullMenu, MenuItem } from '../../data/menuData';
import { UserPreferences } from '../../components/LunchQuizModal';

interface ChatContext {
    activeVibe?: string;
    preferences?: UserPreferences | null;
    lang?: string;
}

export function buildSystemPrompt(context: ChatContext): string {
    const lang = context.lang || 'en';
    const isRu = lang === 'ru';

    // 1. Build Menu Summary
    // Extract unique categories
    const categories = Array.from(new Set(fullMenu.map((item: MenuItem) => item.category)));

    let menuSummary = "MENU:\n";
    categories.forEach((cat: string) => {
        menuSummary += `--- ${cat.toUpperCase()} ---\n`;
        const items = fullMenu.filter((i: MenuItem) => i.category === cat);
        items.forEach((item: MenuItem) => {
            menuSummary += `- ${item.name} (${item.price}): ${item.desc} [ID: ${item.id}]\n`;
        });
    });

    // 2. Build User Persona
    let userPersona = "";
    if (context.preferences) {
        userPersona = isRu ? "КОНТЕКСТ КЛИЕНТА:\n" : "CUSTOMER CONTEXT:\n";
        const p = context.preferences;

        // Map quiz answers to readable preferences
        if (p.email) userPersona += `- Email: ${p.email}\n`;
        if (p.spice) userPersona += `- Spice Preference: ${p.spice}\n`;
        if (p.mood) userPersona += `- Current Mood: ${p.mood}\n`;
        if (p.hunger) userPersona += `- Hunger Level: ${p.hunger}\n`;
    }

    // 3. System Instructions
    const instructions = isRu ?
        `Ты — Бо, ИИ-официант ресторана Bo Restaurant в Дубае (вьетнамская кухня).
    Твоя цель: продавать блюда из МЕНЮ, быть вежливым и кратким.
    
    ПРАВИЛА:
    1. Если клиент просит порекомендовать — используй КОНТЕКСТ КЛИЕНТА.
    2. Всегда предлагай конкретные блюда из МЕНЮ с ценами.
    3. Если клиент хочет заказать ("хочу фо", "беру это"):
       Вставь в конец ответа специальный код: [ORDER: {"id": "ID_БЛЮДА", "qty": 1}]
       Пример: "Отличный выбор! Добавил Фо Бо в корзину. [ORDER: {"id": "pho-bo-special", "qty": 1}]"
    4. Не придумывай блюда, которых нет в меню.
    5. Отвечай коротко, с эмодзи.`
        :
        `You are Bo, the AI Waiter at Bo Restaurant Dubai (Vietnamese cuisine).
    Your goal: sell items from the MENU, be polite and concise.
    
    RULES:
    1. If asked for recommendations, use CUSTOMER CONTEXT.
    2. Suggest dishes from the MENU matching their MOOD and SPICE level.
    3. If the user wants to order ("I want pho", "add this"):
       Append this code to your response: [ORDER: {"id": "ITEM_ID", "qty": 1}]
       Example: "Great choice! Added Pho Bo to your cart. [ORDER: {"id": "pho-bo-special", "qty": 1}]"
    4. Do not invent dishes not in the menu.
    5. Keep answers short, use emojis.`;

    return `${instructions}\n\n${menuSummary}\n\n${userPersona}`;
}
