'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageSquare, X, Send, Sparkles, BrainCircuit } from 'lucide-react'
import LunchQuizModal, { UserPreferences } from './LunchQuizModal'

interface Message {
    role: 'user' | 'assistant'
    content: string
}

export default function FloatingChat({ lang, activeVibe, onVibeChange }: { lang: string, activeVibe: string, onVibeChange?: (vibe: string) => void }) {
    const [isOpen, setIsOpen] = useState(false)
    const [quizOpen, setQuizOpen] = useState(false)
    const [preferences, setPreferences] = useState<UserPreferences | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Load preferences
    useEffect(() => {
        const saved = localStorage.getItem('bo_user_prefs')
        if (saved) {
            try { setPreferences(JSON.parse(saved)) } catch (e) { console.error('Failed to parse prefs', e) }
        }
    }, [])

    const handleSend = async (text: string, isHidden: boolean = false) => {
        if (!text.trim() || isLoading) return

        if (!isHidden) {
            setMessages(prev => [...prev, { role: 'user', content: text }])
            setInput('')
        }
        setIsLoading(true)

        try {
            setError(null)
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, { role: 'user', content: text }],
                    context: { activeVibe, preferences }
                })
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.error || 'Failed to connect')
            }

            const data = await response.json()

            if (data.content) {
                let content = data.content

                // Agentic Vibe Check
                const vibeMatch = content.match(/\[VIBE: (\w+)\]/)
                if (vibeMatch) {
                    const newVibe = vibeMatch[1].toLowerCase()
                    if (['classic', 'spicy', 'vegan', 'seafood', 'sweet'].includes(newVibe)) {
                        onVibeChange?.(newVibe)
                        content = content.replace(/\[VIBE: \w+\]/, '').trim()
                    }
                }

                setMessages(prev => [...prev, { role: 'assistant', content: content }])
            }
        } catch (error) {
            console.error('Failed to chat', error)
            setError(lang === 'ru' ? 'Ошибка соединения. Попробуйте позже.' : 'Connection error. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleQuizComplete = (prefs: UserPreferences) => {
        setPreferences(prefs)
        localStorage.setItem('bo_user_prefs', JSON.stringify(prefs))
        setIsOpen(true) // Open chat automatically

        // Auto-greet with context
        const contextPrompt = lang === 'ru'
            ? `Я прошел квиз. Мои предпочтения: Голод: ${prefs.hunger}, Острота: ${prefs.spice}, Настроение: ${prefs.mood}. Что посоветуешь?`
            : `I finished the quiz. My prefs: Hunger: ${prefs.hunger}, Spice: ${prefs.spice}, Mood: ${prefs.mood}. Recommend something!`

        // Send hidden system message to trigger AI response
        handleSend(contextPrompt, true)
    }

    // Trigger Surprise Me
    const handleSurpriseMe = async () => {
        if (isLoading) return
        setIsOpen(true)
        const surprisePrompt = lang === 'ru'
            ? `Посоветуй что-нибудь неожиданное из категории ${activeVibe}`
            : `Surprise me with something ${activeVibe}`

        // Add fake user message for UI
        setMessages(prev => [...prev, { role: 'user', content: "✨ Surprise Me!" }])
        // Send hidden system message to trigger AI response
        handleSend(surprisePrompt, true)
    }

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [messages.length])

    // Initial greeting
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            const greeting = lang === 'ru'
                ? 'Привет! Я Бо, ваш AI-официант. Что бы вы хотели попробовать сегодня? 🍜'
                : lang === 'ar'
                    ? 'مرحباً! أنا بو، النادل الذكي. ماذا تود أن تجرب اليوم؟ 🍜'
                    : 'Hi! I\'m Bo, your AI waiter. What are you in the mood for today? 🍜'

            setMessages([{ role: 'assistant', content: greeting }])
        }
    }, [isOpen, lang, messages.length])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        handleSend(input)
    }

    return (
        <>
            <LunchQuizModal
                isOpen={quizOpen}
                onClose={() => setQuizOpen(false)}
                onComplete={handleQuizComplete}
                lang={lang}
            />

            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-6 right-6 z-50 bg-gradient-to-r from-red-600 to-yellow-500 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform duration-300 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
            >
                <MessageSquare size={28} fill="currentColor" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                </span>
            </button>

            {/* Chat Interface */}
            <div
                className={`fixed bottom-6 right-6 z-50 w-full max-w-sm bg-black/90 backdrop-blur-xl border border-zinc-800 rounded-3xl shadow-2xl transition-all duration-500 origin-bottom-right flex flex-col overflow-hidden max-h-[600px] ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-50 opacity-0 translate-y-20 pointer-events-none'
                    }`}
            >
                {/* Header */}
                <div className="p-4 bg-gradient-to-r from-red-600/20 to-yellow-500/20 border-b border-white/10 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="bg-gradient-to-br from-red-500 to-yellow-500 p-2 rounded-lg">
                            <Sparkles size={16} className="text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-sm">Bo AI Waiter</h3>
                            <p className="text-xs text-green-400 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Online
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="text-zinc-400 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>


                {/* Quick Actions (only if empty) */}
                {messages.length <= 1 && (
                    <div className="px-4 pt-2 -mb-2 flex gap-2">
                        <button
                            onClick={() => setQuizOpen(true)}
                            disabled={isLoading}
                            className="flex-1 bg-gradient-to-r from-green-600 to-teal-600 text-white text-xs py-2 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                        >
                            <BrainCircuit size={12} />
                            {lang === 'ru' ? 'Подобрать блюдо' : 'Find my Vibe'}
                        </button>
                        <button
                            onClick={handleSurpriseMe}
                            disabled={isLoading}
                            className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs py-2 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                        >
                            <Sparkles size={12} />
                            {lang === 'ru' ? 'Удиви меня!' : 'Surprise Me!'}
                        </button>
                    </div>
                )}
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] scrollbar-thin scrollbar-thumb-zinc-800">
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                                    ? 'bg-white text-black font-medium rounded-tr-sm'
                                    : 'bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-tl-sm'
                                    }`}
                            >
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-zinc-900 px-4 py-3 rounded-2xl rounded-tl-sm flex gap-1 items-center">
                                <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    )}
                    {error && (
                        <div className="flex justify-center my-2">
                            <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-xs px-3 py-1.5 rounded-full">
                                {error}
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSubmit} className="p-4 border-t border-white/10 bg-black/50">
                    <div className="relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={lang === 'ru' ? "Спросите что-нибудь..." : "Ask about dishes..."}
                            className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-full pl-5 pr-12 py-3 text-sm focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/50 transition-all placeholder:text-zinc-600"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isLoading}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-yellow-500 text-black rounded-full hover:bg-yellow-400 disabled:opacity-50 disabled:hover:bg-yellow-500 transition-colors"
                        >
                            <Send size={16} />
                        </button>
                    </div>
                </form>
            </div >
        </>
    )
}
