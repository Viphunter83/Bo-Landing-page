import { db } from '../firebase'
import {
    addDoc,
    getDocs,
    query,
    where,
    orderBy,
    Timestamp,
    deleteDoc,
    doc,
    limit
} from 'firebase/firestore'
import { getTenantCollection } from './tenant_db'

export type ExpenseCategory = 'COGS' | 'Labor' | 'Rent' | 'Marketing' | 'Utilities' | 'Maintenance' | 'Other'

export interface Expense {
    id: string
    amount: number
    category: ExpenseCategory
    description: string
    date: Date
    createdBy?: string
}

const COLLECTION = 'expenses'

export async function addExpense(expense: Omit<Expense, 'id'>, tenantId?: string) {
    if (!db) throw new Error('Firestore not initialized')

    // Add createdAt metadata
    const data = {
        ...expense,
        date: Timestamp.fromDate(expense.date),
        createdAt: Timestamp.now()
    }

    return addDoc(getTenantCollection(COLLECTION, tenantId), data)
}

export async function getExpenses(startDate: Date, endDate: Date, tenantId?: string) {
    if (!db) return []

    const q = query(
        getTenantCollection(COLLECTION, tenantId),
        where('date', '>=', Timestamp.fromDate(startDate)),
        where('date', '<=', Timestamp.fromDate(endDate)),
        orderBy('date', 'desc')
    )

    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => {
        const data = doc.data()
        return {
            id: doc.id,
            ...data,
            date: data.date.toDate()
        } as Expense
    })
}

export async function deleteExpense(id: string, tenantId?: string) {
    if (!db) throw new Error('Firestore not initialized')
    return deleteDoc(doc(getTenantCollection(COLLECTION, tenantId), id))
}
