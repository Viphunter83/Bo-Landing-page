'use client'

import { useState, useEffect } from 'react'
import { db } from '../../lib/firebase'
import { collection, query, getDocs, where } from 'firebase/firestore'
import { Mail, Send, CheckCircle, Users as UsersIcon, Flame, Copy, Sparkles, Instagram, Send as SendIcon } from 'lucide-react'
import { useToast } from '../context/ToastContext'
import { fullMenu } from '../../data/menuData'

interface Lead {
    id: string
    email: string
    spice: string
    mood: string
    createdAt: any
    marketing_segments: string[]
    last_quiz_date?: any
}

export default function MarketingPage() {
    const [leads, setLeads] = useState<Lead[]>([])
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const { showToast } = useToast()

    // Generator State
    const [genPlatform, setGenPlatform] = useState('Instagram')
    const [genTopic, setGenTopic] = useState(fullMenu[0]?.id || 'general')
    const [genTone, setGenTone] = useState('Excited')
    const [genResult, setGenResult] = useState('')
    const [generating, setGenerating] = useState(false)

    useEffect(() => {
        if (!db) return
        const fetchLeads = async () => {
            // Fetch all quiz results that have an email
            const q = query(collection(db!, 'quiz_results'))
            const snap = await getDocs(q)

            const validLeads: Lead[] = []
            snap.forEach(doc => {
                const data = doc.data()
                if (data.email && data.email.includes('@')) {
                    validLeads.push({ id: doc.id, ...data } as Lead)
                }
            })

            setLeads(validLeads)
            setLoading(false)
        }

        fetchLeads()
    }, [])

    const sendCampaign = async (segment: string) => {
        setSending(true)
        try {
            const res = await fetch('/api/marketing/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ segment })
            })
            const data = await res.json()
            if (data.success) {
                showToast(`Sent directly to ${data.count} users in "${segment}" segment! 🚀`, 'success')
            }
        } catch (e) {
            console.error(e)
            showToast('Failed to send campaign', 'error')
        }
        setSending(false)
    }

    const handleGenerate = async () => {
        setGenerating(true)
        setGenResult('')
        try {
            const res = await fetch('/api/marketing/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    platform: genPlatform,
                    topic: genTopic,
                    tone: genTone,
                    lang: 'ru' // Defaulting to RU for this user based on history, or make selectable
                })
            })
            const data = await res.json()
            if (data.success) {
                setGenResult(data.content)
            } else {
                showToast('Failed to generate', 'error')
            }
        } catch (e) {
            showToast('Generation error', 'error')
        }
        setGenerating(false)
    }

    const copyToClipboard = () => {
        navigator.clipboard.writeText(genResult)
        showToast('Copied to clipboard!', 'success')
    }

    // Stats
    const spicyLovers = leads.filter(l => l.spice === 'spicy' || l.spice === 'fire').length
    const healthyVibe = leads.filter(l => l.mood === 'healthy').length
    const totalLeads = leads.length

    if (loading) return <div className="text-zinc-500">Loading leads...</div>

    return (
        <div className="space-y-8">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Marketing Hub</h1>
                    <p className="text-zinc-400">Turn Quiz Data into Revenue.</p>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 px-6 py-3 rounded-xl flex items-center gap-3">
                    <UsersIcon className="text-yellow-500" />
                    <div>
                        <div className="text-2xl font-bold text-white">{totalLeads}</div>
                        <div className="text-xs text-zinc-500 uppercase tracking-wider">Total Leads</div>
                    </div>
                </div>
            </header>

            {/* AI Generator Section */}
            <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border border-indigo-500/30 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-32 bg-indigo-500/10 blur-[100px] rounded-full" />

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-indigo-500 rounded-lg text-white">
                            <Sparkles size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-white">AI Social Media Agent</h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Controls */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs text-indigo-300 uppercase font-bold mb-2">Platform</label>
                                <div className="flex gap-2">
                                    {['Instagram', 'Stories', 'Telegram'].map(p => (
                                        <button
                                            key={p}
                                            onClick={() => setGenPlatform(p)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${genPlatform === p ? 'bg-indigo-500 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-indigo-300 uppercase font-bold mb-2">Topic / Dish</label>
                                    <select
                                        value={genTopic}
                                        onChange={(e) => setGenTopic(e.target.value)}
                                        className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500"
                                    >
                                        {fullMenu.map(item => (
                                            <option key={item.id} value={item.id}>{item.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-indigo-300 uppercase font-bold mb-2">Tone</label>
                                    <select
                                        value={genTone}
                                        onChange={(e) => setGenTone(e.target.value)}
                                        className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500"
                                    >
                                        <option value="Excited">🤩 Excited / Hype</option>
                                        <option value="Elegant">✨ Elegant / Luxury</option>
                                        <option value="Storytelling">📖 Storytelling</option>
                                        <option value="Funny">😂 Funny / Meme</option>
                                    </select>
                                </div>
                            </div>

                            <button
                                onClick={handleGenerate}
                                disabled={generating}
                                className="w-full bg-white text-indigo-900 font-black py-4 rounded-xl hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {generating ? <div className="animate-spin h-5 w-5 border-2 border-indigo-900 border-t-transparent rounded-full" /> : <Sparkles size={20} />}
                                GENERATE MAGIC
                            </button>
                        </div>

                        {/* Result */}
                        <div className="bg-black/30 rounded-xl p-4 border border-indigo-500/20 relative min-h-[200px]">
                            {genResult ? (
                                <>
                                    <textarea
                                        value={genResult}
                                        readOnly
                                        className="w-full h-full bg-transparent text-zinc-200 text-sm resize-none focus:outline-none min-h-[160px]"
                                    />
                                    <button
                                        onClick={copyToClipboard}
                                        className="absolute bottom-4 right-4 bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-lg transition-colors"
                                    >
                                        <Copy size={16} />
                                    </button>
                                </>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-zinc-600 gap-2">
                                    <Sparkles size={32} className="opacity-20" />
                                    <p className="text-sm">Ready to create viral content...</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Segments Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Spicy Segment */}
                <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-32 bg-red-500/10 blur-[100px] rounded-full group-hover:bg-red-500/20 transition-all" />

                    <div className="relative z-10">
                        <div className="flex items-start justify-between mb-6">
                            <div className="w-12 h-12 bg-red-500/20 text-red-500 rounded-xl flex items-center justify-center">
                                <Flame size={24} />
                            </div>
                            <span className="bg-zinc-800 text-zinc-400 px-3 py-1 rounded-full text-xs font-medium">
                                {spicyLovers} Users
                            </span>
                        </div>

                        <h3 className="text-xl font-bold text-white mb-2">Spice Lovers 🔥</h3>
                        <p className="text-zinc-400 text-sm mb-6">
                            Users who chose &quot;Spicy&quot; or &quot;On Fire&quot;. Promote the Bun Bo Hue Challenge.
                        </p>

                        <button
                            onClick={() => sendCampaign('spicy')}
                            disabled={sending || spicyLovers === 0}
                            className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {sending ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div> : <Send size={18} />}
                            Send &quot;Too Hot To Handle&quot; Promo
                        </button>
                    </div>
                </div>

                {/* Healthy Segment */}
                <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-32 bg-green-500/10 blur-[100px] rounded-full group-hover:bg-green-500/20 transition-all" />

                    <div className="relative z-10">
                        <div className="flex items-start justify-between mb-6">
                            <div className="w-12 h-12 bg-green-500/20 text-green-500 rounded-xl flex items-center justify-center">
                                <UsersIcon size={24} />
                            </div>
                            <span className="bg-zinc-800 text-zinc-400 px-3 py-1 rounded-full text-xs font-medium">
                                {healthyVibe} Users
                            </span>
                        </div>

                        <h3 className="text-xl font-bold text-white mb-2">Healthy Vibes 🥗</h3>
                        <p className="text-zinc-400 text-sm mb-6">
                            Users who want &quot;Healthy & Light&quot;. Promote the Summer Rolls & Vegan Pho.
                        </p>

                        <button
                            onClick={() => sendCampaign('healthy')}
                            disabled={sending || healthyVibe === 0}
                            className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {sending ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div> : <Send size={18} />}
                            Send &quot;Fresh Start&quot; Promo
                        </button>
                    </div>
                </div>
            </div>

            {/* Campaign Tester / Recent Lead Table (Simplified) */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-zinc-800">
                    <h3 className="text-lg font-bold text-white">Recent Leads</h3>
                </div>
                <div className="max-h-60 overflow-y-auto">
                    <table className="w-full text-left text-sm text-zinc-400">
                        <thead className="bg-zinc-950 sticky top-0">
                            <tr>
                                <th className="p-4 font-medium">Email</th>
                                <th className="p-4 font-medium">Spice</th>
                                <th className="p-4 font-medium">Mood</th>
                                <th className="p-4 font-medium">Date</th>
                                <th className="p-4 font-medium">Segments</th>
                                <th className="p-4 font-medium">Last Quiz</th>
                                <th className="p-4 font-medium">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leads.slice(0, 10).map((pref) => (
                                <tr key={pref.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20">
                                    <td className="p-4 text-white">{pref.email}</td>
                                    <td className="p-4 capitalize">{pref.spice}</td>
                                    <td className="p-4 capitalize">{pref.mood}</td>
                                    <td className="p-4">
                                        {pref.createdAt?.seconds
                                            ? new Date(pref.createdAt.seconds * 1000).toLocaleDateString()
                                            : 'Just now'}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex gap-2">
                                            {pref.marketing_segments?.includes('spicy_lover') && <span className="bg-red-500/20 text-red-400 text-xs px-2 py-1 rounded">&quot;Spicy&quot;</span>}
                                            {pref.marketing_segments?.includes('healthy') && <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded">&quot;Healthy&quot;</span>}
                                            {pref.marketing_segments?.includes('moody') && <span className="bg-purple-500/20 text-purple-400 text-xs px-2 py-1 rounded">&quot;Moody&quot;</span>}
                                            {pref.marketing_segments?.length === 0 && <span className="text-zinc-600 text-xs text-center">&quot;None&quot;</span>}
                                        </div>
                                    </td>
                                    <td className="p-4 text-zinc-400">
                                        {pref.last_quiz_date?.seconds
                                            ? new Date(pref.last_quiz_date.seconds * 1000).toLocaleDateString()
                                            : 'N/A'}
                                    </td>
                                    <td className="p-4">
                                        <button onClick={() => showToast(`Sending individual offer to ${pref.email}...`, 'info')} className="text-blue-400 hover:text-blue-300 text-sm">
                                            Send &quot;Personal&quot;
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {leads.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-zinc-600">
                                        No leads captured yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
