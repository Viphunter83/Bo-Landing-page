import { db } from './firebase'
import { collection, addDoc, query, where, getDocs, updateDoc, doc, serverTimestamp, getDoc } from 'firebase/firestore'

export type CouponType = 'discount_percentage' | 'discount_fixed' | 'free_item'

export interface Coupon {
    id?: string
    code: string
    type: CouponType
    value: number | string // e.g. 20 (percent) or "Free Dessert"
    status: 'active' | 'used' | 'expired'
    userId?: string // Linked to specific user (optional)
    createdAt: any
    expiryDate?: any
    redeemedAt?: any
}

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Removed ambiguous chars like I, 1, O, 0

export async function generateUniqueCode(length = 6): Promise<string> {
    if (!db) throw new Error('DB not initialized')

    let isUnique = false
    let code = ''

    while (!isUnique) {
        code = ''
        for (let i = 0; i < length; i++) {
            code += CHARS.charAt(Math.floor(Math.random() * CHARS.length))
        }

        // Check code existence
        const q = query(collection(db, 'coupons'), where('code', '==', code))
        const snapshot = await getDocs(q)
        if (snapshot.empty) {
            isUnique = true
        }
    }
    return code
}

export async function createCoupon(data: {
    type: CouponType
    value: number | string
    userId?: string
    expiryDays?: number
}) {
    if (!db) throw new Error('DB not initialized')

    const code = await generateUniqueCode()
    const expiry = new Date()
    expiry.setDate(expiry.getDate() + (data.expiryDays || 7)) // Default 7 days validity

    const coupon: Omit<Coupon, 'id'> = {
        code,
        type: data.type,
        value: data.value,
        status: 'active',
        userId: data.userId,
        createdAt: serverTimestamp(),
        expiryDate: expiry
    }

    const docRef = await addDoc(collection(db, 'coupons'), coupon)
    return { id: docRef.id, ...coupon }
}

export async function getCouponByCode(code: string): Promise<Coupon | null> {
    if (!db) return null

    // Normalize code
    const cleanCode = code.toUpperCase().trim()

    const q = query(collection(db, 'coupons'), where('code', '==', cleanCode))
    const snapshot = await getDocs(q)

    if (snapshot.empty) return null

    const docSnap = snapshot.docs[0]
    return { id: docSnap.id, ...docSnap.data() } as Coupon
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
