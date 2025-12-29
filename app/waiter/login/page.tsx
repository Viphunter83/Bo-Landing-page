'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { Lock, ArrowRight, Loader } from 'lucide-react'

export default function WaiterLogin() {
    const [pin, setPin] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()

    const handleLogin = useCallback(async () => {
        if (pin.length !== 4) return
        setLoading(true)
        setError('')

        try {
            // Fetch correct PIN from settings
            // If settings doesn't exist or no PIN, fallback to 1234
            let correctPin = '1234'

            if (db) {
                const docRef = doc(db, 'site_settings', 'general')
                const snap = await getDoc(docRef)
                if (snap.exists() && snap.data().waiterPin) {
                    correctPin = snap.data().waiterPin
                }
            }

            if (pin === correctPin) {
                // Success
                localStorage.setItem('waiter_auth', 'true')
                router.push('/waiter')
            } else {
                setError('Invalid PIN')
                setPin('')
            }
        } catch (e) {
            console.error(e)
            setError('System Error')
        }
        setLoading(false)
    }, [pin, router])

    const appendDigit = (digit: string) => {
        if (pin.length < 4) {
            setPin(prev => prev + digit)
        }
    }

    const clear = () => {
        setPin('')
    }

    // Auto submit on 4th digit
    useEffect(() => {
        if (pin.length === 4) handleLogin()
    }, [pin, handleLogin])

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-sm space-y-8">
                <div className="text-center space-y-2">
                    <div className="bg-zinc-800 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Lock size={32} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">Waiter Access</h1>
                    <p className="text-zinc-500">Enter your 4-digit security PIN</p>
                </div>

                <div className="flex justify-center gap-4 my-8 h-16">
                    {[0, 1, 2, 3].map(i => (
                        <div key={i} className={`w-4 h-4 rounded-full transition-all duration-300 ${i < pin.length ? 'bg-white scale-125' : 'bg-zinc-800'}`} />
                    ))}
                </div>

                {error && (
                    <div className="text-red-500 text-center font-bold animate-pulse bg-red-500/10 py-2 rounded-lg border border-red-500/20">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                        <button
                            key={num}
                            onClick={() => appendDigit(num.toString())}
                            className="bg-zinc-900 hover:bg-zinc-800 active:scale-95 transition-all h-20 rounded-2xl text-2xl font-bold flex items-center justify-center border border-zinc-800"
                        >
                            {num}
                        </button>
                    ))}
                    <button
                        onClick={clear}
                        className="bg-zinc-900 hover:bg-red-900/20 hover:text-red-500 active:scale-95 transition-all h-20 rounded-2xl text-sm font-bold flex items-center justify-center border border-zinc-800 uppercase"
                    >
                        Clear
                    </button>
                    <button
                        onClick={() => appendDigit('0')}
                        className="bg-zinc-900 hover:bg-zinc-800 active:scale-95 transition-all h-20 rounded-2xl text-2xl font-bold flex items-center justify-center border border-zinc-800"
                    >
                        0
                    </button>
                    <button
                        onClick={handleLogin}
                        disabled={loading || pin.length !== 4}
                        className="bg-white text-black hover:bg-zinc-200 active:scale-95 transition-all h-20 rounded-2xl flex items-center justify-center disabled:opacity-50 disabled:pointer-events-none"
                    >
                        {loading ? <Loader className="animate-spin" /> : <ArrowRight />}
                    </button>
                </div>
            </div>
        </div>
    )
}
