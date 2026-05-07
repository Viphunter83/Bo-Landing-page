import { getAdminDb } from './firebase-admin'
import { getAdminTenantCollection } from './db/tenant_db_admin'
import { FieldValue, FieldPath } from 'firebase-admin/firestore'
import { RecipeItem } from './types/inventory'

/**
 * Deducts stock for a given order using Firebase Admin SDK.
 * Suitable for API routes and Webhooks.
 */
export async function deductStockForOrderAdmin(orderId: string, orderItems: any[]) {
    if (!orderItems || orderItems.length === 0) return

    const db = getAdminDb()

    try {
        await db.runTransaction(async (transaction) => {
            // 1. Fetch Menu Items in the Order (to get their recipes)
            const itemNames = orderItems.map(i => i.name)

            // Note: 'in' queries limited to 10.
            const menuSnapshot = await transaction.get(
                getAdminTenantCollection('menu_items').where('name', 'in', itemNames)
            )

            const menuMap = new Map()
            menuSnapshot.docs.forEach(d => menuMap.set(d.data().name, d.data()))

            // 2. Calculate Ingredient Usage
            const ingredientUsage = new Map<string, number>() // id -> total check

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

            // 3. Fetch Ingredients to Check Stock
            // We use standard reads here (blocking)
            const ingredientIds = Array.from(ingredientUsage.keys())
            const ingredientsRefs = ingredientIds.map(id => getAdminTenantCollection('ingredients').doc(id))
            const ingredientsDocs = await transaction.getAll(...ingredientsRefs)

            const depletedIngredientIds: string[] = []
            const updatesByIngredientString: { ref: any, newStock: number, id: string }[] = []

            ingredientsDocs.forEach(doc => {
                if (!doc.exists) return
                const data = doc.data()
                const ingId = doc.id
                const usage = ingredientUsage.get(ingId) || 0
                const currentStock = data?.currentStock || 0
                const newStock = currentStock - usage

                updatesByIngredientString.push({ ref: doc.ref, newStock, id: ingId })

                // Mark for Stop List if depleted
                // We consider <= 0 as depleted
                if (newStock <= 0) {
                    depletedIngredientIds.push(ingId)
                }
            })

            // 4. ATOMIC STOP LIST: If any ingredient is depleted, fetch dependent menu items NOW
            // to update them in the same transaction.
            if (depletedIngredientIds.length > 0) {
                // WE MUST READ before WRITING in a transaction.

                const inStockMenuQuery = getAdminTenantCollection('menu_items').where('stock', '==', 'in_stock')
                const inStockMenuSnap = await transaction.get(inStockMenuQuery)

                inStockMenuSnap.docs.forEach(menuDoc => {
                    const item = menuDoc.data()
                    if (!item.recipe) return

                    // Check if this item uses any depleted ingredient
                    const usesDepleted = (item.recipe as RecipeItem[]).some(
                        r => depletedIngredientIds.includes(r.ingredientId)
                    )

                    if (usesDepleted) {
                        transaction.update(menuDoc.ref, {
                            stock: 'out_of_stock',
                            updatedAt: FieldValue.serverTimestamp()
                        })
                        console.log(`[Atomic StopList] Disabling ${item.name} due to depletion`)
                    }
                })
            }

            // 5. Apply Ingredient Updates (Writes)
            updatesByIngredientString.forEach(update => {
                transaction.update(update.ref, {
                    currentStock: update.newStock,
                    updatedAt: FieldValue.serverTimestamp()
                })

                // Log Transaction
                const txRef = getAdminTenantCollection('inventory_transactions').doc()
                transaction.set(txRef, {
                    ingredientId: update.id,
                    type: 'order',
                    quantity: - (ingredientUsage.get(update.id) || 0),
                    referenceId: orderId,
                    createdAt: FieldValue.serverTimestamp(),
                    createdBy: 'system (webhook)',
                    isOversold: update.newStock < 0 // Flag oversold
                })
            })
        })
        console.log(`[Inventory] Atomic deduction complete for Order ${orderId}`)

    } catch (e) {
        console.error("[Inventory] Transaction failed:", e)
        // We log error but don't crash webhook (let Stripe retry if network error, but logic error is final)
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
        const menuSnap = await getAdminTenantCollection('menu_items').where('name', 'in', itemNames).get()
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
            const q = await getAdminTenantCollection('ingredients').where(FieldPath.documentId(), 'in', chunk).get()
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
