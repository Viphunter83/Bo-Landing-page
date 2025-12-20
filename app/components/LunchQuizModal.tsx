'use client'

import { useState, useEffect } from 'react'
import { X, ChevronRight, Flame, Leaf, Utensils, Zap, PartyPopper } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export interface UserPreferences {
    hunger: 'snack' | 'meal' | 'serving'
    spice: 'none' | 'mild' | 'spicy' | 'fire'
    mood: 'comfort' | 'healthy' | 'party' | 'adventurous'
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

    // Reset state when opening
    useEffect(() => {
        if (isOpen) {
            setStep(0)
            setAnswers({})
        }
    }, [isOpen])

    const handleOptionSelect = (value: string) => {
        const currentQuestionId = QUESTIONS[step].id
        const newAnswers = { ...answers, [currentQuestionId]: value }
        setAnswers(newAnswers)

        if (step < QUESTIONS.length - 1) {
            setTimeout(() => setStep(step + 1), 200) // Slight delay for better UX
        } else {
            // Quiz Finished
            setTimeout(() => {
                onComplete(newAnswers as UserPreferences)
                onClose()
            }, 300)
        }
    }

    if (!isOpen) return null

    const currentQ = QUESTIONS[step]

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
                        animate={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }}
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
                    </AnimatePresence>
                </div>

                {/* Footer/Context */}
                <div className="p-4 text-center text-xs text-zinc-600 border-t border-zinc-800/50">
                    Step {step + 1} of {QUESTIONS.length}
                </div>
            </motion.div>
        </div>
    )
}
