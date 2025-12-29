import { db } from '../firebase'
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { GameStats } from '../types/marketing'

export async function checkCooldown(userId: string, gameId: 'shake_game' | 'lunch_quiz'): Promise<{ allowed: boolean, remainingMs: number }> {
    if (!db) return { allowed: true, remainingMs: 0 }

    const docRef = doc(db, 'users', userId, 'game_stats', gameId)
    const snap = await getDoc(docRef)

    if (!snap.exists()) {
        return { allowed: true, remainingMs: 0 }
    }

    const data = snap.data() as GameStats
    const lastPlayed = data.lastPlayedAt?.toDate()

    if (!lastPlayed) return { allowed: true, remainingMs: 0 }

    const now = new Date()
    const diff = now.getTime() - lastPlayed.getTime()
    const cooldown = 24 * 60 * 60 * 1000 // 24 hours

    if (diff < cooldown) {
        return { allowed: false, remainingMs: cooldown - diff }
    }

    return { allowed: true, remainingMs: 0 }
}

export async function recordGamePlay(userId: string, gameId: 'shake_game' | 'lunch_quiz', won: boolean, prize?: string) {
    if (!db) return

    const docRef = doc(db, 'users', userId, 'game_stats', gameId)
    const snap = await getDoc(docRef)
    const now = serverTimestamp()

    if (!snap.exists()) {
        await setDoc(docRef, {
            userId,
            gameId,
            lastPlayedAt: now,
            streak: 1,
            totalWins: won ? 1 : 0,
            bestPrize: prize || null
        })
    } else {
        const data = snap.data() as GameStats
        // Simple streak logic: if last played < 48 hours, increment. Else reset.
        // For MVP just increment match played.

        await updateDoc(docRef, {
            lastPlayedAt: now,
            totalWins: won ? (data.totalWins || 0) + 1 : (data.totalWins || 0),
            // Update prize if better? For now just last prize logic or simple log
            lastPrize: prize || null
        })
    }
}
