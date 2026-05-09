'use client'

import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'
import { useTenant } from '../context/TenantContext'

export default function FAQ({ lang }: { lang: string }) {
    const tenantConfig = useTenant()
    const [openIndex, setOpenIndex] = useState<number | null>(null)
    const data = tenantConfig.content.faq

    const titles = {
        en: 'Frequently Asked Questions',
        ru: 'Частые вопросы',
        vn: 'Câu hỏi thường gặp',
        ar: 'أسئلة مكررة'
    }
    // @ts-ignore
    const title = titles[lang] || titles.en

    return (
        <section className="py-24 bg-background text-foreground">
            <div className="container mx-auto px-6 max-w-4xl">
                <h2 className="text-3xl md:text-5xl font-black mb-12 text-center text-transparent bg-clip-text bg-gradient-to-r from-foreground to-muted-foreground">
                    {title}
                </h2>

                <div className="space-y-4">
                    {data.map((item, index) => {
                        // @ts-ignore
                        const question = item.question[lang] || item.question.en
                        // @ts-ignore
                        const answer = item.answer[lang] || item.answer.en

                        return (
                            <div
                                key={index}
                                className="border border-border rounded-2xl overflow-hidden bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/50"
                            >
                                <button
                                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                    className="w-full flex justify-between items-center p-6 text-left"
                                >
                                    <span className="text-lg font-bold pr-8">{question}</span>
                                    {openIndex === index ? (
                                        <Minus className="text-primary flex-shrink-0" />
                                    ) : (
                                        <Plus className="text-muted-foreground flex-shrink-0" />
                                    )}
                                </button>

                                <div
                                    className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                        }`}
                                >
                                    <p className="p-6 pt-0 text-muted-foreground leading-relaxed">
                                        {answer}
                                    </p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
