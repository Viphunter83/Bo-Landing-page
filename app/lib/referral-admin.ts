import { getAdminDb } from './firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

/**
 * Generates a unique referral code and creates a coupon.
 * Uses Admin SDK for secure checks and writes.
 */
export async function getOrCreateReferralCodeAdmin(userId: string, userName: string = 'FRIEND'): Promise<string> {
    const db = getAdminDb()
    const userRef = db.collection('customers').doc(userId)

    // 1. Check existing
    const userSnap = await userRef.get()
    if (userSnap.exists && userSnap.data()?.referralCode) {
        return userSnap.data()?.referralCode
    }

    // 2. Generate Code
    const cleanName = (userName.split(' ')[0] || 'FRIEND').replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 10)
    let isUnique = false
    let code = ''
    let attempts = 0

    while (!isUnique && attempts < 5) {
        const suffix = Math.floor(100 + Math.random() * 900)
        code = `BO-${cleanName}-${suffix}`

        // Check uniqueness in coupons collection
        const q = await db.collection('coupons').where('code', '==', code).get()
        if (q.empty) isUnique = true
        attempts++
    }

    if (!isUnique) throw new Error("Failed to generate unique code")

    // 3. Create Coupon & Update User Atomically? 
    // Not strictly necessary to be atomic across collections if low risk, but good practice.
    // However, Coupon ID is auto-generated.

    const couponRef = db.collection('coupons').doc()
    const expiry = new Date()
    expiry.setFullYear(expiry.getFullYear() + 10) // 10 years

    const batch = db.batch()

    // Create Coupon
    batch.set(couponRef, {
        code,
        type: 'discount_fixed',
        value: 50,
        minOrder: 100,
        source: 'referral',
        userId: userId,
        status: 'active',
        createdAt: FieldValue.serverTimestamp(),
        expiresAt: expiry
    })

    // Update User
    batch.set(userRef, {
        referralCode: code,
        referralCreatedAt: FieldValue.serverTimestamp()
    }, { merge: true })

    await batch.commit()

    return code
}

/**
 * Validates referral code and returns referrer ID.
 */
export async function resolveReferralCodeAdmin(code: string): Promise<string | null> {
    const db = getAdminDb()
    const q = await db.collection('customers').where('referralCode', '==', code.toUpperCase().trim()).limit(1).get()

    if (q.empty) return null
    return q.docs[0].id
}


/**
 * Rewards referrer (Admin SDK)
 */
export async function rewardReferrerAdmin(referrerId: string, amount: number) {
    const db = getAdminDb()
    const ref = db.collection('customers').doc(referrerId)

    await ref.update({
        walletBalance: FieldValue.increment(amount),
        totalReferralEarnings: FieldValue.increment(amount),
        totalReferrals: FieldValue.increment(1)
    })
}
