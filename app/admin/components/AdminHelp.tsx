'use client'

import { useState } from 'react'
import { HelpCircle, X, Globe } from 'lucide-react'

interface AdminHelpProps {
    pageName: string
    content: {
        ru: {
            title: string
            steps: string[]
            tips?: string[]
        }
        en: {
            title: string
            steps: string[]
            tips?: string[]
        }
    }
}

export default function AdminHelp({ pageName, content }: AdminHelpProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [lang, setLang] = useState<'ru' | 'en'>('ru')

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="p-2 text-zinc-400 hover:text-yellow-500 transition-colors rounded-full hover:bg-zinc-800"
                title="Help / Помощь"
            >
                <HelpCircle size={20} />
            </button>
        )
    }

    const t = content[lang]

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-zinc-800 bg-zinc-950">
                    <div className="flex items-center gap-2">
                        <HelpCircle className="text-yellow-500" size={24} />
                        <h3 className="text-xl font-bold text-white">
                            {pageName} <span className="text-zinc-500 text-sm font-normal">| Manual</span>
                        </h3>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Language Toggle */}
                        <button
                            onClick={() => setLang(lang === 'ru' ? 'en' : 'ru')}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-zinc-800 text-xs font-bold text-zinc-300 hover:text-white hover:bg-zinc-700 transition"
                        >
                            <Globe size={14} />
                            {lang.toUpperCase()}
                        </button>
                        <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-zinc-800 rounded-full text-zinc-500 hover:text-white">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 md:p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    <h2 className="text-2xl font-black text-white mb-6">{t.title}</h2>

                    <div className="space-y-6">
                        <div>
                            <h4 className="text-sm font-bold text-zinc-500 uppercase mb-3 tracking-wider">
                                {lang === 'ru' ? 'КАК ЭТО РАБОТАЕТ' : 'HOW IT WORKS'}
                            </h4>
                            <ul className="space-y-3">
                                {t.steps.map((step, i) => (
                                    <li key={i} className="flex gap-3 text-zinc-300 leading-relaxed">
                                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-zinc-800 text-zinc-400 flex items-center justify-center text-xs font-bold border border-zinc-700">
                                            {i + 1}
                                        </span>
                                        <span>{step}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {t.tips && (
                            <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl">
                                <h4 className="text-yellow-500 font-bold text-sm mb-2 flex items-center gap-2">
                                    💡 {lang === 'ru' ? 'СОВЕТЫ ПРОФИ' : 'PRO TIPS'}
                                </h4>
                                <ul className="list-disc list-inside space-y-1 text-sm text-yellow-500/80">
                                    {t.tips.map((tip, i) => (
                                        <li key={i}>{tip}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex justify-end">
                    <button
                        onClick={() => setIsOpen(false)}
                        className="px-6 py-2 bg-white text-black font-bold rounded-lg hover:bg-zinc-200 transition"
                    >
                        {lang === 'ru' ? 'Понятно' : 'Got it'}
                    </button>
                </div>
            </div>
        </div>
    )
}
