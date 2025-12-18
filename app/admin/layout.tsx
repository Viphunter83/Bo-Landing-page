'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { LayoutDashboard, Menu, Users, Settings, LogOut } from 'lucide-react'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    return (
        <div className="min-h-screen bg-zinc-950 text-white flex">
            {/* Sidebar */}
            <aside className="w-64 border-r border-zinc-800 p-6 flex flex-col">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-500 to-red-600 bg-clip-text text-transparent">
                        Bo OS
                    </h1>
                    <p className="text-xs text-zinc-500">Restaurant Operating System</p>
                </div>

                <nav className="flex-1 space-y-2">
                    <NavLink href="/admin" icon={<LayoutDashboard size={20} />} label="Dashboard" />
                    <NavLink href="/admin/menu" icon={<Menu size={20} />} label="Menu Manager" />
                    <NavLink href="/admin/bookings" icon={<Users size={20} />} label="Bookings" />
                    <NavLink href="/admin/settings" icon={<Settings size={20} />} label="Settings" />
                </nav>

                <button className="flex items-center gap-3 text-zinc-400 hover:text-white mt-auto p-3 rounded-lg hover:bg-zinc-900 transition-colors">
                    <LogOut size={20} />
                    <span>Sign Out</span>
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    )
}

function NavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
    return (
        <Link
            href={href}
            className="flex items-center gap-3 text-zinc-400 hover:text-white hover:bg-zinc-900 p-3 rounded-lg transition-colors"
        >
            {icon}
            <span>{label}</span>
        </Link>
    )
}
