'use client'

import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'
import { faqData } from '../data/faqData'

export default function FAQ({ lang }: { lang: string }) {
    const [openIndex, setOpenIndex] = useState<number | null>(0)
    const data = faqData[lang as keyof typeof faqData] || faqData.en

    const title = lang === 'ru' ? 'Частые вопросы' : lang === 'ar' ? 'أسئلة مكررة' : 'Frequently Asked Questions'

    return (
        <section className="py-24 bg-zinc-950 text-white">
            <div className="container mx-auto px-6 max-w-4xl">
                <h2 className="text-3xl md:text-5xl font-black mb-12 text-center text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-500">
                    {title}
                </h2>

                <div className="space-y-4">
                    {data.map((item, index) => (
                        <div
                            key={index}
                            className="border border-zinc-800 rounded-2xl overflow-hidden bg-white/5 backdrop-blur-sm transition-all duration-300 hover:border-zinc-700"
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full flex justify-between items-center p-6 text-left"
                            >
                                <span className="text-lg font-bold pr-8">{item.question}</span>
                                {openIndex === index ? (
                                    <Minus className="text-yellow-500 flex-shrink-0" />
                                ) : (
                                    <Plus className="text-zinc-500 flex-shrink-0" />
                                )}
                            </button>

                            <div
                                className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
                                    }`}
                            >
                                <p className="p-6 pt-0 text-zinc-400 leading-relaxed">
                                    {item.answer}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
