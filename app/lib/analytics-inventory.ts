import { db } from './firebase'
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore'
import { Ingredient } from './types/inventory'

export interface InventoryInsight {
    ingredientId: string
    dailyBurnRate: number
    daysUntilEmpty: number
    status: 'stable' | 'warning' | 'critical'
}

/**
 * Calculates analytics for all ingredients based on last 7 days of usage.
 */
export async function generateInventoryInsights(ingredients: Ingredient[]): Promise<Record<string, InventoryInsight>> {
    if (!db || ingredients.length === 0) return {}

    // 1. Define window (7 days)
    const days = 7
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // 2. Fetch ALL 'order' and 'waste' transactions from last 7 days
    // Optimization: Fetching one big list is better than N queries
    const q = query(
        collection(db, 'inventory_transactions'),
        where('createdAt', '>=', startDate),
        where('type', 'in', ['order', 'waste'])
    )

    const snapshot = await getDocs(q)

    // 3. Aggregate Usage by Ingredient
    const usageMap = new Map<string, number>() // id -> total quantity used

    snapshot.docs.forEach(doc => {
        const data = doc.data()
        const qty = Math.abs(data.quantity || 0)
        const current = usageMap.get(data.ingredientId) || 0
        usageMap.set(data.ingredientId, current + qty)
    })

    // 4. Calculate Insights
    const insights: Record<string, InventoryInsight> = {}

    ingredients.forEach(ing => {
        const totalUsed = usageMap.get(ing.id) || 0
        const dailyBurnRate = totalUsed / days

        // Avoid division by zero
        const daysUntilEmpty = dailyBurnRate > 0 ? (ing.currentStock / dailyBurnRate) : 999

        let status: 'stable' | 'warning' | 'critical' = 'stable'
        if (daysUntilEmpty < 2) status = 'critical'
        else if (daysUntilEmpty < 5) status = 'warning'

        insights[ing.id] = {
            ingredientId: ing.id,
            dailyBurnRate,
            daysUntilEmpty,
            status
        }
    })

    return insights
}
