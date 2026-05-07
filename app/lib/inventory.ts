import { db } from './firebase'
import { doc, getDoc, getDocs, runTransaction, query, where, serverTimestamp, increment } from 'firebase/firestore'
import { getTenantCollection } from './db/tenant_db'
import { Ingredient, RecipeItem, InventoryTransaction } from './types/inventory'

/**
 * Deducts stock for a given order.
 * This should be called AFTER payment confirmation.
 */
export async function deductStockForOrder(orderId: string, orderItems: any[]) {
    if (!orderItems || orderItems.length === 0) return
    const firestore = db
    if (!firestore) return

    try {
        await runTransaction(firestore, async (transaction) => {
            // 1. Fetch all menu items involved to get their recipes
            // We need to fetch by name or some identifier found in orderItems
            // Assuming orderItems has 'name' which matches menu_items 'name'
            // Optimization: Fetch all menu items once or query only needed ones.
            // For simplicity, we'll query needed ones.

            const itemNames = orderItems.map(i => i.name)

            // NOTE: 'in' query limit is 10. If order has > 10 distinct items, we need batching.
            // For now assuming < 10 distinct items per order for MVP.
            const menuQuery = query(getTenantCollection('menu_items'), where('name', 'in', itemNames))
            const menuSnap = await getDocs(menuQuery)

            const menuMap = new Map()
            menuSnap.docs.forEach(d => {
                menuMap.set(d.data().name, d.data())
            })

            // 2. Calculate total ingredient usage
            const ingredientUsage = new Map<string, number>() // ingredientId -> totalQuantity

            for (const item of orderItems) {
                const menuItem = menuMap.get(item.name)
                if (!menuItem || !menuItem.recipe) continue

                const qty = item.quantity || 1

                for (const recipeItem of menuItem.recipe as RecipeItem[]) {
                    const totalNeeded = recipeItem.quantity * qty
                    const current = ingredientUsage.get(recipeItem.ingredientId) || 0
                    ingredientUsage.set(recipeItem.ingredientId, current + totalNeeded)
                }
            }

            if (ingredientUsage.size === 0) return // No ingredients to deduct

            // 3. Deduct Stock & Create Transactions
            const usageEntries = Array.from(ingredientUsage.entries())
            for (const [ingId, amount] of usageEntries) {
                const ingRef = doc(getTenantCollection('ingredients'), ingId)
                const ingDoc = await transaction.get(ingRef)

                if (!ingDoc.exists()) continue

                const newStock = (ingDoc.data().currentStock || 0) - amount

                // Update Ingredient
                transaction.update(ingRef, {
                    currentStock: newStock,
                    updatedAt: serverTimestamp()
                })

                // Create Transaction Record
                const txRef = doc(getTenantCollection('inventory_transactions'))
                transaction.set(txRef, {
                    ingredientId: ingId,
                    type: 'order',
                    quantity: -amount,
                    referenceId: orderId,
                    createdAt: serverTimestamp(),
                    createdBy: 'system'
                })
            }
        })
        console.log(`Inventory deducted for order ${orderId}`)
    } catch (error) {
        console.error("Failed to deduct inventory:", error)
        // We do not throw here to avoid failing the webhook response, 
        // but IRL we might want to alert admin
    }
}

/**
 * Checks if stock is sufficient for an order.
 * Returns array of missing items.
 */
export async function checkAvailability(orderItems: any[]) {
    // Similar logic to above but readonly and returns missing stuff
    // To be implemented for "Pre-checkout" validation
    return true
}
