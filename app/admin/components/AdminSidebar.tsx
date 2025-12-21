'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    Menu,
    Users,
    Settings,
    Megaphone,
    Truck,
    BarChart3,
    Database,
    LogOut,
    X,
    Sliders
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface AdminSidebarProps {
    isOpen: boolean
    onClose: () => void
    onSignOut: () => void
}

export default function AdminSidebar({ isOpen, onClose, onSignOut }: AdminSidebarProps) {
    return (
        <>
            {/* Mobile Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar Container */}
            <aside className={`fixed top-0 left-0 z-50 h-full w-64 bg-zinc-950 border-r border-zinc-800 transform transition-transform duration-300 md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="h-full flex flex-col p-6">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-500 to-red-600 bg-clip-text text-transparent">
                                Bo OS
                            </h1>
                            <p className="text-xs text-zinc-500">Restaurant Operating System</p>
                        </div>
                        <button onClick={onClose} className="text-zinc-500 hover:text-white md:hidden">
                            <X size={24} />
                        </button>
                    </div>

                    <nav className="flex-1 space-y-1">
                        <NavLink href="/admin" icon={<LayoutDashboard size={20} />} label="Dashboard" />
                        <hr className="border-zinc-800 my-2" />
                        <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 pl-3">Operations</div>
                        <NavLink href="/admin/menu" icon={<Menu size={20} />} label="Menu Manager" />
                        <NavLink href="/admin/kitchen" icon={<Users size={20} />} label="Kitchen Display" />
                        <NavLink href="/admin/customers" icon={<Users size={20} />} label="CRM / Guests" />
                        <NavLink href="/admin/delivery" icon={<Truck size={20} />} label="Delivery" />

                        <hr className="border-zinc-800 my-2" />
                        <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 pl-3">Insights</div>
                        <NavLink href="/admin/analytics" icon={<BarChart3 size={20} />} label="Analytics" />
                        <NavLink href="/admin/marketing" icon={<Megaphone size={20} />} label="Marketing" />

                        <hr className="border-zinc-800 my-2" />
                        <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 pl-3">System</div>
                        <NavLink href="/admin/settings" icon={<Sliders size={20} />} label="Site Content" />
                        <NavLink href="/admin/migration" icon={<Database size={20} />} label="Migration" />
                    </nav>

                    <button
                        onClick={onSignOut}
                        className="flex items-center gap-3 text-zinc-400 hover:text-white mt-auto p-3 rounded-lg hover:bg-zinc-900 transition-colors w-full group"
                    >
                        <LogOut size={20} className="group-hover:text-red-500 transition-colors" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>
        </>
    )
}

function NavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
    const pathname = usePathname()
    // Exact match for dashboard, startsWith for others to handle sub-routes if any
    const isActive = href === '/admin' ? pathname === href : pathname.startsWith(href)

    return (
        <Link
            href={href}
            className={`flex items-center gap-3 p-3 rounded-lg transition-all ${isActive
                ? 'bg-zinc-900 text-white border-l-2 border-red-500'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
                }`}
        >
            {icon}
            <span className="font-medium text-sm">{label}</span>
        </Link>
    )
}
