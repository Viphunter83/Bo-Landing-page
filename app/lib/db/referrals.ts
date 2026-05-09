import { db } from '../firebase'
import { doc, getDoc, updateDoc, serverTimestamp, increment, query, where, getDocs } from 'firebase/firestore'
import { getTenantCollection } from './tenant_db'
import { createCoupon } from '../coupons'

/**
 * Generates a unique referral code for a user.
 * Format: BO-[FIRSTNAME]-[3_DIGITS] (e.g. BO-ALEX-492)
 */
export async function getOrCreateReferralCode(userId: string, userName: string = 'FRIEND', tenantId?: string): Promise<string> {
    if (!db) throw new Error("Database not initialized")

    const userRef = doc(getTenantCollection('customers', tenantId), userId)

    // 1. Check if already has code
    const snapshot = await getDoc(userRef)
    if (snapshot.exists() && snapshot.data().referralCode) {
        return snapshot.data().referralCode
    }

    // 2. Generate New Code
    // Clean name: take first word, uppercase, strip non-alpha
    const cleanName = (userName.split(' ')[0] || 'FRIEND').replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 10)

    let isUnique = false
    let code = ''
    let attempts = 0

    // Retry loop for uniqueness
    while (!isUnique && attempts < 5) {
        const suffix = Math.floor(100 + Math.random() * 900) // 3 digits
        code = `BO-${cleanName}-${suffix}`

        // We check uniqueness against COUPONS collection now, as that's the source of truth for redeeming
        const q = query(getTenantCollection('coupons', tenantId), where('code', '==', code))
        const qSnap = await getDocs(q)
        if (qSnap.empty) {
            isUnique = true
        }
        attempts++
    }

    if (!isUnique) throw new Error("Failed to generate unique referral code")

    // 3. Save to User Profile
    await updateDoc(userRef, {
        referralCode: code,
        referralCreatedAt: serverTimestamp()
    })

    // 4. Create Persistent Coupon
    await createCoupon({
        code,
        type: 'discount_fixed',
        value: 50, // 50 AED Reward for Friend
        minOrder: 100, // Min Order 100 AED
        source: 'referral',
        userId: userId, // Owner of the code
        expiryDays: 3650 // 10 Years
    }, tenantId)

    return code
}

/**
 * Validates a referral code and returns the Referrer ID (User ID).
 */
export async function resolveReferralCode(code: string, tenantId?: string): Promise<string | null> {
    if (!db || !code) return null

    // Format normalization ?? Maybe strictly uppercase
    const cleanCode = code.trim().toUpperCase()

    const q = query(getTenantCollection('customers', tenantId), where('referralCode', '==', cleanCode))
    const snapshot = await getDocs(q)

    if (snapshot.empty) return null

    return snapshot.docs[0].id // This is the Referrer's Phone/ID
}

/**
 * Rewards the referrer with credit.
 * Should be called after the referee completes their first order.
 */
export async function rewardReferrer(referrerId: string, amount: number, tenantId?: string) {
    if (!db) return

    const referrerRef = doc(getTenantCollection('customers', tenantId), referrerId)

    try {
        await updateDoc(referrerRef, {
            walletBalance: increment(amount),
            totalReferralEarnings: increment(amount),
            totalReferrals: increment(1)
        })
        console.log(`[Referral] Rewarded ${referrerId} with ${amount} AED`)
    } catch (e) {
        console.error(`[Referral] Failed to reward ${referrerId}`, e)
    }
}
