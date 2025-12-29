import { db } from './firebase'
import { collection, addDoc, query, where, getDocs, updateDoc, doc, serverTimestamp, getDoc, orderBy } from 'firebase/firestore'
import { Coupon, CouponType, CouponSource } from './types/marketing'

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export async function generateUniqueCode(length = 6): Promise<string> {
    if (!db) throw new Error('DB not initialized')

    let isUnique = false
    let code = ''

    while (!isUnique) {
        code = ''
        for (let i = 0; i < length; i++) {
            code += CHARS.charAt(Math.floor(Math.random() * CHARS.length))
        }

        const q = query(collection(db, 'coupons'), where('code', '==', code))
        const snapshot = await getDocs(q)
        if (snapshot.empty) isUnique = true
    }
    return code
}

export async function createCoupon(data: {
    type: CouponType
    value: number | string
    userId?: string
    expiryDays?: number
    source: CouponSource
    minOrder?: number
}) {
    if (!db) throw new Error('DB not initialized')

    const code = await generateUniqueCode()
    const expiry = new Date()
    expiry.setDate(expiry.getDate() + (data.expiryDays || 7))

    const couponData = {
        code,
        type: data.type,
        value: data.value,
        status: 'active',
        userId: data.userId || null,
        source: data.source,
        minOrder: data.minOrder || 0,
        createdAt: serverTimestamp(),
        expiresAt: expiry
    }

    const docRef = await addDoc(collection(db, 'coupons'), couponData)

    // Return with ID
    return {
        id: docRef.id,
        ...couponData,
        // Mock timestamps for immediate UI feedback if needed, 
        // though serverTimestamp is null locally until fetch.
        createdAt: new Date(),
        expiresAt: expiry
    } as Coupon
}

export async function getCouponByCode(code: string): Promise<Coupon | null> {
    if (!db) return null
    const cleanCode = code.toUpperCase().trim()
    const q = query(collection(db, 'coupons'), where('code', '==', cleanCode))
    const snapshot = await getDocs(q)

    if (snapshot.empty) return null
    const docSnap = snapshot.docs[0]
    const data = docSnap.data()

    // Check expiry
    if (data.expiresAt?.toDate() < new Date()) {
        // Auto-expire if found? Maybe not write, just return status
        return { id: docSnap.id, ...data, status: 'expired' } as Coupon
    }

    return { id: docSnap.id, ...data } as Coupon
}

export async function getUserCoupons(userId: string): Promise<Coupon[]> {
    if (!db) return []

    const q = query(
        collection(db, 'coupons'),
        where('userId', '==', userId),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc')
    )

    const snapshot = await getDocs(q)
    const coupons: Coupon[] = []

    snapshot.forEach(doc => {
        const data = doc.data()
        // Filter expired client-side to be safe or use sophisticated query
        if (data.expiresAt?.toDate() > new Date()) {
            coupons.push({ id: doc.id, ...data } as Coupon)
        }
    })

    return coupons
}

export async function redeemCoupon(couponId: string) {
    if (!db) throw new Error('DB not initialized')
    const ref = doc(db, 'coupons', couponId)
    await updateDoc(ref, {
        status: 'used',
        redeemedAt: serverTimestamp()
    })
    return true
}
