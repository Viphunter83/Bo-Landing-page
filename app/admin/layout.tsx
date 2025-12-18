'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from '../lib/firebase'
import { LayoutDashboard, Menu, Users, Settings, LogOut } from 'lucide-react'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        if (!auth) return
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
            <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500">
                Loading Bo OS...
            </div>
        )
    }

    // Login Page Layout (Full Screen, No Sidebar)
    if (pathname === '/admin/login') {
        return <>{children}</>
    }

    // Protected Admin Layout
    if (!user) return null // Should redirect in useEffect, but just in case

    return (
        <div className="min-h-screen bg-zinc-950 text-white flex">
            {/* Sidebar */}
            <aside className="w-64 border-r border-zinc-800 p-6 flex flex-col fixed h-full">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-500 to-red-600 bg-clip-text text-transparent">
                        Bo OS
                    </h1>
                    <p className="text-xs text-zinc-500">Restaurant Operating System</p>
                </div>

                <nav className="flex-1 space-y-2">
                    <NavLink href="/admin" icon={<LayoutDashboard size={20} />} label="Dashboard" />
                    <NavLink href="/admin/migration" icon={<Settings size={20} />} label="Migration" />
                    {/* <NavLink href="/admin/menu" icon={<Menu size={20} />} label="Menu Manager" /> */}
                    {/* <NavLink href="/admin/bookings" icon={<Users size={20} />} label="Bookings" /> */}
                </nav>

                <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 text-zinc-400 hover:text-white mt-auto p-3 rounded-lg hover:bg-zinc-900 transition-colors w-full"
                >
                    <LogOut size={20} />
                    <span>Sign Out</span>
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 ml-64 overflow-y-auto">
                <div className="max-w-5xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}

function NavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
    const pathname = usePathname()
    const isActive = pathname === href

    return (
        <Link
            href={href}
            className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${isActive
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
        >
            {icon}
            <span>{label}</span>
        </Link>
    )
}
