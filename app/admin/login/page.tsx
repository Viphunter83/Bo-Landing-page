'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth'
import { auth } from '../../lib/firebase'
import Cookies from 'js-cookie'
import { Shield, Lock, AlertCircle, ChefHat } from 'lucide-react'
import Image from 'next/image'

function LoginContent() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()
    const searchParams = useSearchParams()
    const redirectUrl = searchParams.get('redirect') || '/admin'

    const handleLogin = async () => {
        setLoading(true)
        setError('')
        try {
            const provider = new GoogleAuthProvider()
            const result = await signInWithPopup(auth!, provider)
            const user = result.user

            // Get ID Token
            const token = await user.getIdToken()

            // Set Cookie (Expires in 7 days)
            // Ideally we use a server-side API to set httpOnly cookie for true security,
            // but for this MVP, client-side JS cookie is sufficient as Middleware can read it.
            Cookies.set('bo_session', token, { expires: 7, secure: true })

            // Optional: Store user role in cookie or local storage if needed for instant UI adaptation
            // For now, middleware just checks existence of session.

            router.push(redirectUrl)
        } catch (e: any) {
            console.error(e)
            setError(e.message || 'Login failed')
        }
        setLoading(false)
    }

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-96 h-96 bg-purple-600/10 blur-[100px] rounded-full" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-600/10 blur-[100px] rounded-full" />
            </div>

            <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-8 relative z-10 shadow-2xl">
                <div className="text-center mb-8">
                    <div className="mx-auto w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mb-4 text-white">
                        <Lock size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Admin Access</h1>
                    <p className="text-zinc-400">Restricted area for authorized staff only.</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 flex items-start gap-3">
                        <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
                        <div className="text-sm text-red-200">{error}</div>
                    </div>
                )}

                <button
                    onClick={handleLogin}
                    disabled={loading}
                    className="w-full bg-white hover:bg-zinc-200 text-black font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                    {loading ? (
                        <div className="animate-spin h-5 w-5 border-2 border-black border-t-transparent rounded-full" />
                    ) : (
                        <>
                            <Image
                                src="https://www.google.com/favicon.ico"
                                alt="Google"
                                width={18}
                                height={18}
                            />
                            <span>Sign in with Google</span>
                        </>
                    )}
                </button>

                <p className="mt-8 text-center text-xs text-zinc-600">
                    Protected by Bo Security System v1.0
                </p>
            </div>
        </div>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>}>
            <LoginContent />
        </Suspense>
    )
}
