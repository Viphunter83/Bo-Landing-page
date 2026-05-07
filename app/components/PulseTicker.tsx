'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendActivity, getInitialTrends } from '../lib/trends'
import { TrendingUp } from 'lucide-react'
import { tenantConfig } from '../lib/config/tenant'

export default function PulseTicker({ lang }: { lang: string }) {
    const [activities, setActivities] = useState<TrendActivity[]>([])
    const [currentIdx, setCurrentIdx] = useState(0)

    // Init data
    useEffect(() => {
        setActivities(getInitialTrends())
    }, [])

    // Subscribe to Realtime Data
    useEffect(() => {
        import('../lib/trends').then(({ subscribeToRealtimeTrends }) => {
            const unsubscribe = subscribeToRealtimeTrends((newActivity) => {
                setActivities(prev => {
                    if (prev.find(a => a.id === newActivity.id)) return prev
                    return [newActivity, ...prev.slice(0, 9)]
                })
                setCurrentIdx(0)
            })
            return () => unsubscribe()
        })
    }, [])

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIdx(prev => (prev + 1) % activities.length)
        }, 4000)
        return () => clearInterval(interval)
    }, [activities.length])

    if (activities.length === 0) return null

    const current = activities[currentIdx]
    // Get message based on language, fallback to EN
    // @ts-ignore
    const message = current.message[lang] || current.message.en
    const isRtl = lang === 'ar'

    return (
        <div className="fixed top-24 left-4 z-40 hidden md:block">
            <AnimatePresence mode="wait">
                <motion.div
                    key={current.id}
                    initial={{ opacity: 0, y: -20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.9 }}
                    className="bg-background/80 backdrop-blur-md border border-primary/30 rounded-full px-4 py-2 flex items-center gap-3 shadow-lg shadow-primary/20 max-w-sm"
                >
                    <div className="bg-primary/20 p-1.5 rounded-full animate-pulse">
                        <TrendingUp size={14} className="text-primary" />
                    </div>
                    <span className={`text-xs font-medium text-foreground ${isRtl ? 'text-right' : 'text-left'} truncate`}>
                        {message}
                    </span>
                </motion.div>
            </AnimatePresence>
        </div>
    )
}
