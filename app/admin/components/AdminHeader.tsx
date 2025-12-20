'use client'

import { Menu, Bell, Search, User } from 'lucide-react'

interface AdminHeaderProps {
    onMenuClick: () => void
    userEmail?: string
}

export default function AdminHeader({ onMenuClick, userEmail }: AdminHeaderProps) {
    return (
        <header className="sticky top-0 z-30 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="text-zinc-400 hover:text-white md:hidden"
                >
                    <Menu size={24} />
                </button>

                {/* Search Bar - Hidden on small mobile */}
                <div className="hidden sm:flex items-center relative">
                    <Search className="absolute left-3 text-zinc-600" size={16} />
                    <input
                        type="text"
                        placeholder="Search orders, menu..."
                        className="bg-zinc-900 border border-zinc-800 rounded-full pl-9 pr-4 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all w-64"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button className="relative text-zinc-400 hover:text-white transition-colors">
                    <Bell size={20} />
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                </button>

                <div className="h-8 w-[1px] bg-zinc-800 mx-1" />

                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <div className="text-sm font-bold text-white">Admin</div>
                        <div className="text-xs text-zinc-500">{userEmail || 'admin@bo-bistro.com'}</div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-red-600 to-yellow-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-red-900/20">
                        {userEmail ? userEmail[0].toUpperCase() : 'B'}
                    </div>
                </div>
            </div>
        </header>
    )
}
