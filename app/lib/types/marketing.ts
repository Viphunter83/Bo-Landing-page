
export type CouponType = 'discount_percentage' | 'discount_fixed' | 'free_item'
export type CouponStatus = 'active' | 'used' | 'expired'
export type CouponSource = 'shake_game' | 'lunch_quiz' | 'admin_gift' | 'referral'

export interface Coupon {
    id: string
    code: string
    type: CouponType
    value: number | string // e.g. 10 (percent) or "Free Phin Coffee"
    status: CouponStatus
    userId?: string
    minOrder?: number
    source: CouponSource
    createdAt: Date | any // Firestore Timestamp
    expiresAt: Date | any
    redeemedAt?: Date | any
}

export interface GameStats {
    userId: string
    gameId: 'shake_game' | 'lunch_quiz'
    lastPlayedAt: Date | any
    streak: number
    totalWins: number
    bestPrize?: string
}
