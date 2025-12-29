export interface Ingredient {
    id: string
    name: string
    unit: 'kg' | 'g' | 'l' | 'ml' | 'pcs'
    currentStock: number
    minStock: number // Threshold for low stock alert
    costPerUnit: number
    updatedAt?: any // Firestore Timestamp
}

export interface RecipeItem {
    ingredientId: string
    quantity: number
}

// Extension to the existing MenuItem type (conceptually)
export interface MenuItemRecipe {
    recipe?: RecipeItem[]
}

export interface InventoryTransaction {
    id: string
    ingredientId: string
    type: 'order' | 'restock' | 'adjustment' | 'waste'
    quantity: number // Negative for usage/waste, positive for restock
    referenceId?: string // Order ID or manual note
    createdAt: any // Firestore Timestamp
    createdBy?: string
}
