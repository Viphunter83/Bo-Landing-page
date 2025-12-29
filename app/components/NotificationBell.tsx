'use client'

import { useState, useEffect } from 'react'
import { Bell, BellOff, BellRing, Check } from 'lucide-react'
import { requestNotificationPermission } from '../lib/firebase-messaging'
import { useTelegram } from '../context/TelegramContext'

export default function NotificationBell() {
    const [permission, setPermission] = useState<NotificationPermission>('default')
    const [loading, setLoading] = useState(false)
    const { user } = useTelegram()

    useEffect(() => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            setPermission(Notification.permission)
        }
    }, [])

    const handleEnable = async () => {
        setLoading(true)
        // Use Telegram ID or Guest ID
        const userId = user?.id?.toString() || localStorage.getItem('bo_guest_id') || 'guest'

        const token = await requestNotificationPermission(userId)
        setLoading(false)

        if (token) {
            setPermission('granted')
        } else if (Notification.permission === 'denied') {
            setPermission('denied')
        }
    }

    // Don't show anything if already granted or denied (to be non-intrusive)
    // Or maybe show a small indicator? Let's hide if granted to keep it clean, but show if default.
    if (permission === 'granted' || permission === 'denied') return null

    // Also hide if not supported
    if (typeof window !== 'undefined' && !('Notification' in window)) return null

    return (
        <button
            onClick={handleEnable}
            disabled={loading}
            className="group relative p-2 rounded-full hover:bg-white/10 transition-colors"
            title="Enable Notifications"
        >
            {loading ? (
                <BellRing className="w-5 h-5 text-yellow-500 animate-pulse" />
            ) : (
                <Bell className="w-5 h-5 text-zinc-400 group-hover:text-yellow-400 transition-colors" />
            )}

            {/* Ping animation to draw attention potentially? No, user said non-intrusive. */}
        </button>
    )
}
