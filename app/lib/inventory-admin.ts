import { getAdminDb } from './firebase-admin'
import { FieldValue, FieldPath } from 'firebase-admin/firestore'
import { RecipeItem } from './types/inventory'

/**
 * Deducts stock for a given order using Firebase Admin SDK.
 * Suitable for API routes and Webhooks.
 */
export async function deductStockForOrderAdmin(orderId: string, orderItems: any[]) {
    if (!orderItems || orderItems.length === 0) return

    const db = getAdminDb()
    const depletedIngredientIds: string[] = []

    try {
        await db.runTransaction(async (transaction) => {
            // 1. Fetch Menu Items (Recipes)
            const itemNames = orderItems.map(i => i.name)

            // Note: 'in' queries are limited to 10. Split if needed.
            // For MVP assuming < 10 distinct items.
            const menuSnapshot = await transaction.get(
                db.collection('menu_items').where('name', 'in', itemNames)
            )

            const menuMap = new Map()
            menuSnapshot.docs.forEach(d => menuMap.set(d.data().name, d.data()))

            // 2. Calculate Usage
            const ingredientUsage = new Map<string, number>() // id -> total

            for (const item of orderItems) {
                const menuItem = menuMap.get(item.name)
                if (!menuItem || !menuItem.recipe) continue

                const qty = item.quantity || 1
                for (const rItem of menuItem.recipe as RecipeItem[]) {
                    const current = ingredientUsage.get(rItem.ingredientId) || 0
                    ingredientUsage.set(rItem.ingredientId, current + (rItem.quantity * qty))
                }
            }

            if (ingredientUsage.size === 0) return

            // 3. Update Ingredients & Create Transactions
            // Use Array.from for map usage in stricter environments if needed
            const usageEntries = Array.from(ingredientUsage.entries())

            for (const [ingId, amount] of usageEntries) {
                const ingRef = db.collection('ingredients').doc(ingId)

                const ingDoc = await transaction.get(ingRef)
                if (!ingDoc.exists) continue

                const currentStock = ingDoc.data()?.currentStock || 0
                const newStock = currentStock - amount

                // Update Stock
                transaction.update(ingRef, {
                    currentStock: newStock,
                    updatedAt: FieldValue.serverTimestamp()
                })

                // Log Transaction
                const txRef = db.collection('inventory_transactions').doc()
                transaction.set(txRef, {
                    ingredientId: ingId,
                    type: 'order',
                    quantity: -amount,
                    referenceId: orderId,
                    createdAt: FieldValue.serverTimestamp(),
                    createdBy: 'system (webhook)'
                })

                if (newStock <= 0) {
                    depletedIngredientIds.push(ingId)
                }
            }
        })
        console.log(`[Inventory] Deducted stock for order ${orderId}`)

        // 4. Trigger Stop List (Post-Transaction)
        if (depletedIngredientIds.length > 0) {
            await disableMenuItemsByIngredients(db, depletedIngredientIds)
        }

    } catch (e) {
        console.error("[Inventory] Failed to deduct stock:", e)
    }
}

/**
 * Stop List: Disables menu items that rely on depleted ingredients.
 */
async function disableMenuItemsByIngredients(db: FirebaseFirestore.Firestore, ingredientIds: string[]) {
    try {
        const menuSnap = await db.collection('menu_items').where('stock', '==', 'in_stock').get()
        const batch = db.batch()
        let updateCount = 0

        menuSnap.docs.forEach(doc => {
            const item = doc.data()
            if (!item.recipe) return

            const usesDepletedIngredient = (item.recipe as RecipeItem[]).some(
                r => ingredientIds.includes(r.ingredientId)
            )

            if (usesDepletedIngredient) {
                batch.update(doc.ref, { stock: 'out_of_stock' })
                updateCount++
                console.log(`[StopList] Constructive disabling: ${item.name}`)
            }
        })

        if (updateCount > 0) {
            await batch.commit()
            console.log(`[StopList] Automatically disabled ${updateCount} dishes due to low stock.`)
        }
    } catch (e) {
        console.error("[StopList] Failed to update menu availability:", e)
    }
}

/**
 * Checks if there is enough stock for a list of items.
 * Returns missing items if any.
 */
export async function checkStockAvailability(items: { name: string, quantity: number }[]) {
    if (!items.length) return { success: true, missingItems: [] }

    const db = getAdminDb()

    try {
        // 1. Fetch Recipes
        const itemNames = items.map(i => i.name)
        const menuSnap = await db.collection('menu_items').where('name', 'in', itemNames).get()
        const menuMap = new Map()
        menuSnap.docs.forEach(d => menuMap.set(d.data().name, d.data()))

        // 2. Calculate Total Ingredient Needs
        const ingredientUsage = new Map<string, number>() // id -> total needed

        for (const item of items) {
            const menuItem = menuMap.get(item.name)
            if (!menuItem || !menuItem.recipe) continue

            for (const rItem of menuItem.recipe as RecipeItem[]) {
                const current = ingredientUsage.get(rItem.ingredientId) || 0
                ingredientUsage.set(rItem.ingredientId, current + (rItem.quantity * item.quantity))
            }
        }

        if (ingredientUsage.size === 0) return { success: true, missingItems: [] }

        // 3. Check Stock Levels
        const ingredientIds = Array.from(ingredientUsage.keys())

        const chunks = []
        for (let i = 0; i < ingredientIds.length; i += 10) {
            chunks.push(ingredientIds.slice(i, i + 10))
        }

        const ingredientsMap = new Map<string, number>() // id -> currentStock

        for (const chunk of chunks) {
            const q = await db.collection('ingredients').where(FieldPath.documentId(), 'in', chunk).get()
            q.docs.forEach(d => ingredientsMap.set(d.id, d.data().currentStock || 0))
        }

        // 4. Verify
        let hasMissing = false
        const usageEntries = Array.from(ingredientUsage.entries())

        for (const [ingId, needed] of usageEntries) {
            const current = ingredientsMap.get(ingId) || 0
            if (current < needed) {
                hasMissing = true
                console.log(`[Validation] Out of stock: Ingredient ${ingId}. Need ${needed}, Have ${current}`)
                break;
            }
        }

        if (hasMissing) {
            return { success: false, missingItems: ['Selected items are out of stock'] }
        }

        return { success: true, missingItems: [] }

    } catch (e) {
        console.error("Stock check failed:", e)
        return { success: false, missingItems: ['System error checking stock'] }
    }
}
