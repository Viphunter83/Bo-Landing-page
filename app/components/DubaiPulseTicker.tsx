'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { generateMockActivity, TrendActivity, getInitialTrends } from '../lib/trends'
import { Bell, TrendingUp } from 'lucide-react'

export default function DubaiPulseTicker({ lang }: { lang: string }) {
    const [activities, setActivities] = useState<TrendActivity[]>([])
    const [currentIdx, setCurrentIdx] = useState(0)

    // Init data
    useEffect(() => {
        setActivities(getInitialTrends())
    }, [])

    // Add new activity every few seconds
    useEffect(() => {
        const interval = setInterval(() => {
            const newActivity = generateMockActivity()
            setActivities(prev => [newActivity, ...prev.slice(0, 9)])
            setCurrentIdx(0) // Reset to show new one
        }, 8000 + Math.random() * 5000)

        return () => clearInterval(interval)
    }, [])

    // Rotate displayed message
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIdx(prev => (prev + 1) % activities.length)
        }, 4000)
        return () => clearInterval(interval)
    }, [activities.length])

    if (activities.length === 0) return null

    const current = activities[currentIdx]
    const message = lang === 'ru' ? current.message.ru : lang === 'ar' ? current.message.ar : current.message.en
    const isRtl = lang === 'ar'

    return (
        <div className="fixed top-24 left-4 z-40 hidden md:block">
            <motion.div
                key={current.id}
                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.9 }}
                className="bg-black/80 backdrop-blur-md border border-yellow-500/30 rounded-full px-4 py-2 flex items-center gap-3 shadow-lg shadow-yellow-900/20 max-w-sm"
            >
                <div className="bg-yellow-500/20 p-1.5 rounded-full animate-pulse">
                    <TrendingUp size={14} className="text-yellow-500" />
                </div>
                <span className={`text-xs font-medium text-white ${isRtl ? 'text-right' : 'text-left'} truncate`}>
                    {message}
                </span>
            </motion.div>
        </div>
    )
}
