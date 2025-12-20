'use client'

import { useState, useEffect } from 'react'
import { X, ChevronRight, Flame, Leaf, Utensils, Zap, PartyPopper } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export interface UserPreferences {
    hunger: 'snack' | 'meal' | 'serving'
    spice: 'none' | 'mild' | 'spicy' | 'fire'
    mood: 'comfort' | 'healthy' | 'party' | 'adventurous'
    email?: string
}

interface LunchQuizModalProps {
    isOpen: boolean
    onClose: () => void
    onComplete: (prefs: UserPreferences) => void
    lang: string
}

const QUESTIONS = [
    {
        id: 'hunger',
        title: { en: "How hungry are you?", ru: "Насколько вы голодны?" },
        options: [
            { value: 'snack', label: { en: "Just a snack", ru: "Перекусить" }, icon: "🥨" },
            { value: 'meal', label: { en: "Normal lunch", ru: "Обычный обед" }, icon: "🍜" },
            { value: 'starving', label: { en: "Starving!", ru: "Умираю с голоду" }, icon: "🦖" },
        ]
    },
    {
        id: 'spice',
        title: { en: "Spice Level?", ru: "Как насчет острого?" },
        options: [
            { value: 'none', label: { en: "No Spice", ru: "Без острого" }, icon: "🧊" },
            { value: 'mild', label: { en: "Mild", ru: "Слегка острый" }, icon: "🌶️" },
            { value: 'spicy', label: { en: "Spicy", ru: "Острый" }, icon: "🔥" },
            { value: 'fire', label: { en: "On Fire!", ru: "Огонь!" }, icon: "🌋" },
        ]
    },
    {
        id: 'mood',
        title: { en: "What's the vibe?", ru: "Какое настроение?" },
        options: [
            { value: 'comfort', label: { en: "Comfort Food", ru: "Уютное" }, icon: "🍲" },
            { value: 'healthy', label: { en: "Healthy & Light", ru: "Легкое и ЗОЖ" }, icon: "🥗" },
            { value: 'party', label: { en: "Party / Drinks", ru: "Вечеринка" }, icon: "🍹" },
            { value: 'adventurous', label: { en: "Surprise Me", ru: "Удиви меня" }, icon: "✨" },
        ]
    }
]

export default function LunchQuizModal({ isOpen, onClose, onComplete, lang }: LunchQuizModalProps) {
    const [step, setStep] = useState(0)
    const [answers, setAnswers] = useState<Partial<UserPreferences>>({})
    const [email, setEmail] = useState('')
    const [submitting, setSubmitting] = useState(false)

    // Reset state when opening
    useEffect(() => {
        if (isOpen) {
            setStep(0)
            setAnswers({})
            setStep(0)
            setAnswers({})
            setEmail('')
            setSubmitting(false)
        }
    }, [isOpen])

    const handleOptionSelect = (value: string) => {
        const currentQuestionId = QUESTIONS[step].id
        const newAnswers = { ...answers, [currentQuestionId]: value }
        setAnswers(newAnswers)

        // If we just answered the last question, go to Email Step (index = QUESTIONS.length)
        // Otherwise, go to next question
        setTimeout(() => {
            setStep(s => s + 1)
        }, 200)
    }

    const handleEmailSubmit = (skipped: boolean) => {
        setSubmitting(true)
        const finalAnswers = { ...answers }
        if (!skipped && email) {
            // @ts-ignore
            finalAnswers.email = email
        }

        // Slight delay to show "sending" state if needed, or just close
        setTimeout(() => {
            onComplete(finalAnswers as UserPreferences)
            onClose()
        }, 500)
    }

    if (!isOpen) return null

    // Determine current view
    const isEmailStep = step === QUESTIONS.length
    const currentQ = QUESTIONS[step]

    // Progress logic: Questions + 1 Email step
    const totalSteps = QUESTIONS.length + 1
    const progress = ((step + 1) / totalSteps) * 100

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative w-full max-w-md bg-[#1a1a1a] border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl"
            >
                {/* Progress Bar */}
                <div className="absolute top-0 left-0 w-full h-1 bg-zinc-800">
                    <motion.div
                        className="h-full bg-gradient-to-r from-red-500 to-yellow-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                    />
                </div>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors z-10"
                >
                    <X size={24} />
                </button>

                <div className="p-8 pt-12">
                    <AnimatePresence mode="wait">
                        {isEmailStep ? (
                            <motion.div
                                key="email-step"
                                initial={{ x: 50, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -50, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="flex flex-col items-center text-center"
                            >
                                <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mb-6 text-3xl">
                                    🎁
                                </div>
                                <h2 className="text-2xl font-black text-white mb-2 leading-tight">
                                    {lang === 'ru' ? 'Почти готово!' : 'Almost done!'}
                                </h2>
                                <p className="text-zinc-400 mb-8">
                                    {lang === 'ru'
                                        ? 'Оставьте email, чтобы получить скидку 10%.'
                                        : 'Leave your email to unlock a 10% discount code.'}
                                </p>

                                <input
                                    type="email"
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white mb-4 focus:outline-none focus:border-yellow-500 transition-colors"
                                />

                                <button
                                    onClick={() => handleEmailSubmit(false)}
                                    disabled={!email || submitting}
                                    className="w-full bg-gradient-to-r from-red-600 to-red-500 text-white font-bold py-3 rounded-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-3"
                                >
                                    {submitting
                                        ? (lang === 'ru' ? 'Сохраняем...' : 'Saving...')
                                        : (lang === 'ru' ? 'Получить Купон' : 'Get Coupon')}
                                </button>

                                <button
                                    onClick={() => handleEmailSubmit(true)}
                                    className="text-sm text-zinc-500 hover:text-white transition-colors underline"
                                >
                                    {lang === 'ru' ? 'Пропустить' : 'Skip & See Results'}
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div
                                key={step}
                                initial={{ x: 50, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -50, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <h2 className="text-2xl font-black text-white mb-8 text-center leading-tight">
                                    {lang === 'ru' ? currentQ.title.ru : currentQ.title.en}
                                </h2>

                                <div className="grid grid-cols-2 gap-4">
                                    {currentQ.options.map((opt) => (
                                        <button
                                            key={opt.value}
                                            onClick={() => handleOptionSelect(opt.value)}
                                            className="flex flex-col items-center justify-center p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl hover:bg-zinc-800 hover:border-yellow-500/50 hover:scale-[1.02] transition-all group"
                                        >
                                            <span className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                                                {opt.icon}
                                            </span>
                                            <span className="text-sm font-bold text-zinc-300 group-hover:text-white text-center">
                                                {lang === 'ru' ? (opt.label as any).ru : (opt.label as any).en}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer/Context */}
                <div className="p-4 text-center text-xs text-zinc-600 border-t border-zinc-800/50">
                    Step {step + 1} of {totalSteps}
                </div>
            </motion.div>
        </div>
    )
}
