'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from '../lib/firebase'
import AdminSidebar from './components/AdminSidebar'
import AdminHeader from './components/AdminHeader'
import { ToastProvider } from './context/ToastContext'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        if (!auth) {
            setLoading(false)
            return
        }
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user)
            setLoading(false)

            if (!user && pathname !== '/admin/login') {
                router.push('/admin/login')
            }
        })
        return () => unsubscribe()
    }, [pathname, router])

    const handleSignOut = async () => {
        if (!auth) return
        await signOut(auth)
        router.push('/admin/login')
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center text-zinc-500 gap-4">
                <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
                <p className="animate-pulse">Loading Bo OS...</p>
            </div>
        )
    }

    // Login Page Layout
    if (pathname === '/admin/login') {
        return (
            <ToastProvider>
                {children}
            </ToastProvider>
        )
    }

    // Configuration Error
    if (!auth && !loading) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-4">
                <h1 className="text-xl font-bold text-red-500 mb-2">Configuration Error</h1>
                <p className="text-zinc-400">Firebase is not initialized. Check your environment variables.</p>
            </div>
        )
    }

    // Redirecting State
    if (!user) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center text-zinc-600 gap-4">
                <div className="w-8 h-8 border-2 border-zinc-600 border-t-zinc-400 rounded-full animate-spin" />
                <p className="text-sm">Redirecting...</p>
            </div>
        )
    }

    return (
        <ToastProvider>
            <div className="min-h-screen bg-zinc-950 text-white flex">
                <AdminSidebar
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                    onSignOut={handleSignOut}
                />

                <div className="flex-1 flex flex-col md:pl-64 transition-all duration-300">
                    <AdminHeader
                        onMenuClick={() => setIsSidebarOpen(true)}
                        userEmail={user.email}
                    />

                    <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                        <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </ToastProvider>
    )
}

