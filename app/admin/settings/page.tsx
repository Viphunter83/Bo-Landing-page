'use client'

import { useState, useEffect } from 'react'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { Save, Image as ImageIcon, Instagram, Link as LinkIcon, AlertCircle } from 'lucide-react'
import { useToast } from '../context/ToastContext'

interface SiteSettings {
    heroImage: string
    heroTitle?: string
    heroSub?: string
    socialImages: string[]
    instagramToken?: string
}

export default function SettingsPage() {
    const [settings, setSettings] = useState<SiteSettings>({
        heroImage: '',
        heroTitle: '',
        heroSub: '',
        socialImages: ['', '', '', ''],
        instagramToken: ''
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const { showToast } = useToast()

    useEffect(() => {
        if (!db) return
        const fetchSettings = async () => {
            try {
                const docRef = doc(db, 'site_settings', 'general')
                const snap = await getDoc(docRef)
                if (snap.exists()) {
                    setSettings(prev => ({ ...prev, ...snap.data() }))
                } else {
                    // Initialize if empty
                    const defaultSettings = {
                        heroImage: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=2600&q=80',
                        socialImages: [
                            '1559339352-11d035aa65de',
                            '1514933651103-005eec06c04b',
                            '1559339352-11d035aa65de',
                            '1514933651103-005eec06c04b'
                        ]
                    }
                    await setDoc(docRef, defaultSettings)
                    setSettings(prev => ({ ...prev, ...defaultSettings }))
                }
            } catch (e) {
                console.error('Error fetching settings:', e)
                showToast('Failed to load settings', 'error')
            }
            setLoading(false)
        }
        fetchSettings()
    }, [])

    const handleSave = async () => {
        if (!db) return
        setSaving(true)
        try {
            await updateDoc(doc(db, 'site_settings', 'general'), { ...settings })
            showToast('Settings saved successfully! 💾', 'success')
        } catch (e) {
            console.error('Error saving:', e)
            showToast('Failed to save settings', 'error')
        }
        setSaving(false)
    }

    if (loading) return <div className="text-zinc-500 animate-pulse">Loading configuration...</div>

    return (
        <div className="space-y-8 max-w-4xl">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Site Content & Settings</h1>
                    <p className="text-zinc-400">Manage visual capability and external integrations.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-white text-black hover:bg-zinc-200 px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all disabled:opacity-50"
                >
                    {saving ? <div className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full" /> : <Save size={18} />}
                    Save Changes
                </button>
            </header>

            {/* Hero Section */}
            <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-6">
                <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
                    <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
                        <ImageIcon size={20} />
                    </div>
                    <h2 className="text-xl font-bold text-white">Main Banner (Hero)</h2>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">Backgound Image URL</label>
                        <div className="flex gap-4">
                            <input
                                type="text"
                                value={settings.heroImage}
                                onChange={e => setSettings({ ...settings, heroImage: e.target.value })}
                                className="flex-1 bg-black border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                placeholder="https://..."
                            />
                        </div>
                        {settings.heroImage && (
                            <div className="mt-4 relative h-48 w-full rounded-lg overflow-hidden border border-zinc-800">
                                <img src={settings.heroImage} alt="Preview" className="w-full h-full object-cover opacity-60" />
                                <div className="absolute inset-0 flex items-center justify-center text-zinc-500 font-mono text-xs bg-black/50">
                                    Preview
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">Title Override (Optional)</label>
                            <input
                                type="text"
                                value={settings.heroTitle}
                                onChange={e => setSettings({ ...settings, heroTitle: e.target.value })}
                                className="w-full bg-black border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                placeholder="Leave empty to use translation"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">Subtitle Override (Optional)</label>
                            <input
                                type="text"
                                value={settings.heroSub}
                                onChange={e => setSettings({ ...settings, heroSub: e.target.value })}
                                className="w-full bg-black border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                placeholder="Leave empty to use translation"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Social Proof */}
            <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-6">
                <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
                    <div className="p-2 bg-pink-500/20 text-pink-400 rounded-lg">
                        <Instagram size={20} />
                    </div>
                    <h2 className="text-xl font-bold text-white">Social Media Feed</h2>
                </div>

                <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Image URLs (Unsplash ID or Full URL)</label>
                    <p className="text-xs text-zinc-500 mb-4">Enter Unsplash Photo IDs (e.g., '1559339352...') OR full image URLs.</p>

                    <div className="space-y-3">
                        {settings.socialImages.map((img, idx) => (
                            <div key={idx} className="flex gap-2">
                                <span className="px-3 py-3 bg-zinc-800 text-zinc-500 rounded-lg font-mono text-sm">#{idx + 1}</span>
                                <input
                                    type="text"
                                    value={img}
                                    onChange={e => {
                                        const newImages = [...settings.socialImages]
                                        newImages[idx] = e.target.value
                                        setSettings({ ...settings, socialImages: newImages })
                                    }}
                                    className="flex-1 bg-black border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-pink-500 transition-colors"
                                    placeholder="Image ID or URL"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Integrations */}
            <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-6 opacity-75">
                <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
                    <div className="p-2 bg-green-500/20 text-green-400 rounded-lg">
                        <LinkIcon size={20} />
                    </div>
                    <h2 className="text-xl font-bold text-white">Integrations <span className="ml-2 text-xs bg-zinc-800 px-2 py-0.5 rounded text-zinc-400">Advanced</span></h2>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">Instagram Basic Display Token</label>
                        <div className="flex gap-2 items-center">
                            <input
                                type="password"
                                value={settings.instagramToken}
                                onChange={e => setSettings({ ...settings, instagramToken: e.target.value })}
                                className="flex-1 bg-black border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500 transition-colors font-mono"
                                placeholder="IGQJ..."
                            />
                        </div>
                        <p className="text-xs text-zinc-500 mt-2 flex items-center gap-1">
                            <AlertCircle size={12} />
                            Token allows automatic feed fetching. Leave empty to use manual images above.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    )
}
