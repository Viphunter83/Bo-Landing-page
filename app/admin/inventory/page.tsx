'use client'

import { useEffect, useState } from 'react'
import { doc, addDoc, updateDoc, deleteDoc, serverTimestamp, increment, onSnapshot, query, orderBy } from 'firebase/firestore'
import { getTenantCollection } from '../../lib/db/tenant_db'
import { Plus, Edit2, Trash2, AlertTriangle, Save, X, History } from 'lucide-react'
import { useToast } from '../context/ToastContext'
import { Ingredient, InventoryTransaction } from '../../lib/types/inventory'
import { generateInventoryInsights, InventoryInsight } from '../../lib/analytics-inventory'
import AdminHelp from '../components/AdminHelp'

export const dynamic = 'force-dynamic'

export default function InventoryManager() {
    const [ingredients, setIngredients] = useState<Ingredient[]>([])
    // ...
    // Note: I will only replace the header part in the second chunk, but I need to do the import first.
    // Wait, I can do both via separate calls or careful chunking. I'll do separate calls for safety.
    // This call is just for Import.

    const [transactions, setTransactions] = useState<InventoryTransaction[]>([])
    const [isCreating, setIsCreating] = useState(false)
    const [isRestocking, setIsRestocking] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editForm, setEditForm] = useState<Partial<Ingredient>>({})
    const [restockForm, setRestockForm] = useState({ id: '', name: '', amount: 0, cost: 0 })
    const [isWastage, setIsWastage] = useState(false)
    const [insights, setInsights] = useState<Record<string, InventoryInsight>>({})
    const { showToast } = useToast()
    const [activeTab, setActiveTab] = useState<'stock' | 'history'>('stock')

    // ... (useEffect hooks match existing) ...

    // ... (handleCreate/Edit/Delete match existing) ...

    const handleRestock = (item: Ingredient) => {
        setRestockForm({ id: item.id, name: item.name, amount: 0, cost: item.costPerUnit })
        setIsRestocking(true)
    }

    const submitRestock = async () => {
        if (!restockForm.amount) return
        try {
            const ingredientsCol = getTenantCollection('ingredients')
            const transactionsCol = getTenantCollection('inventory_transactions')
            const ingRef = doc(ingredientsCol, restockForm.id)

            // 1. Update Stock Atomic
            await updateDoc(ingRef, {
                currentStock: increment(restockForm.amount),
                costPerUnit: restockForm.cost, // Update cost if changed
                updatedAt: serverTimestamp()
            })

            // 2. Log Transaction
            await addDoc(transactionsCol, {
                ingredientId: restockForm.id,
                type: 'restock',
                quantity: restockForm.amount,
                referenceId: 'manual_restock',
                createdAt: serverTimestamp(),
                createdBy: 'admin'
            })

            showToast(`Restocked ${restockForm.name}`, "success")
            setIsRestocking(false)
        } catch (e) {
            console.error(e)
            showToast("Restock failed", "error")
        }
    }

    const handleWastage = (item: Ingredient) => {
        setRestockForm({ id: item.id, name: item.name, amount: 0, cost: item.costPerUnit })
        setIsWastage(true)
    }

    const submitWastage = async () => {
        if (!restockForm.amount) return
        try {
            const ingredientsCol = getTenantCollection('ingredients')
            const transactionsCol = getTenantCollection('inventory_transactions')
            const ingRef = doc(ingredientsCol, restockForm.id)

            // Atomic decrement
            await updateDoc(ingRef, {
                currentStock: increment(-restockForm.amount),
                updatedAt: serverTimestamp()
            })

            await addDoc(transactionsCol, {
                ingredientId: restockForm.id,
                type: 'waste',
                quantity: -restockForm.amount, // Negative for usage/waste
                referenceId: 'manual_waste',
                createdAt: serverTimestamp(),
                createdBy: 'admin'
            })

            showToast(`Logged waste for ${restockForm.name}`, "info")
            setIsWastage(false)
        } catch (e) {
            console.error(e)
            showToast("Failed to log waste", "error")
        }
    }
    useEffect(() => {
        try {
            const col = getTenantCollection('ingredients')
            const q = query(col, orderBy('name'))
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Ingredient))
                setIngredients(data)

                // Generate Insights
                generateInventoryInsights(data).then(setInsights)
            })
            return () => unsubscribe()
        } catch (e) {
            console.error("Failed to subscribe to ingredients:", e)
        }
    }, [])

    // Fetch Recent Transactions (Limit 50 ideally, but simple for now)
    useEffect(() => {
        if (activeTab !== 'history') return
        try {
            const col = getTenantCollection('inventory_transactions')
            const q = query(col, orderBy('createdAt', 'desc'))
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as InventoryTransaction))
                setTransactions(data)
            })
            return () => unsubscribe()
        } catch (e) {
            console.error("Failed to subscribe to transactions:", e)
        }
    }, [activeTab])

    const handleCreate = () => {
        setEditForm({
            name: '',
            unit: 'kg',
            currentStock: 0,
            minStock: 5,
            costPerUnit: 0
        })
        setIsCreating(true)
        setEditingId(null)
    }

    const handleEdit = (item: Ingredient) => {
        setEditForm(item)
        setEditingId(item.id)
        setIsCreating(true)
    }

    const handleSave = async () => {
        if (!editForm.name) return showToast("Name is required", "error")

        try {
            const col = getTenantCollection('ingredients')
            const payload = {
                ...editForm,
                updatedAt: serverTimestamp()
            }

            if (editingId) {
                await updateDoc(doc(col, editingId), payload)
                showToast("Ingredient updated", "success")
            } else {
                await addDoc(col, payload)
                showToast("Ingredient created", "success")
            }
            setIsCreating(false)
        } catch (e) {
            console.error(e)
            showToast("Failed to save", "error")
        }
    }

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Delete ${name}? This might break recipes!`)) return
        try {
            const col = getTenantCollection('ingredients')
            await deleteDoc(doc(col, id))
            showToast("Deleted", "info")
        } catch (e) {
            showToast("Failed to delete", "error")
        }
    }

    return (
        <div className="space-y-6 text-white min-h-screen">
            <div className="flex justify-between items-center bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
                <div>
                    <div className="flex items-center gap-3">
                        <h2 className="text-3xl font-black mb-1">Inventory</h2>
                        <AdminHelp
                            pageName="Inventory / Stock"
                            content={{
                                ru: {
                                    title: "Склад и Инвентарь",
                                    steps: [
                                        "Управление остатками продуктов (Current Stock).",
                                        "Restock (+): Добавить количество, когда привезли товар.",
                                        "Waste (-): Списать испорченное или потраченное мимо кассы.",
                                        "History: Вкладка истории показывает все движения.",
                                        "Low Stock: Система подсветит красным, если запасы ниже минимума."
                                    ],
                                    tips: [
                                        "Daily Burn: Аналитика покажет, на сколько дней хватит запасов.",
                                        "Cost/Unit: Обновляйте цену при закупке — это важно для фудкоста."
                                    ]
                                },
                                en: {
                                    title: "Inventory Management",
                                    steps: [
                                        "Track ingredient usage and leftovers.",
                                        "Restock (+): Add quantity on new delivery.",
                                        "Waste (-): Log spoilage or accidental loss.",
                                        "History: View audit log of all manual changes.",
                                        "Low Stock: Auto-alerts when below threshold."
                                    ],
                                    tips: [
                                        "Daily Burn: Estimation of how many days regarding recent sales.",
                                        "Cost/Unit: Keep updated for accurate food cost reports."
                                    ]
                                }
                            }}
                        />
                    </div>
                    <p className="text-zinc-400">Manage stock and ingredients</p>
                </div>
                <div className="flex gap-2">
                    <div className="flex bg-zinc-800 rounded-lg p-1 mr-4">
                        <button
                            onClick={() => setActiveTab('stock')}
                            className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'stock' ? 'bg-zinc-600 text-white' : 'text-zinc-400 hover:text-white'}`}
                        >
                            Stock
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-zinc-600 text-white' : 'text-zinc-400 hover:text-white'}`}
                        >
                            History
                        </button>
                    </div>

                    <button
                        onClick={handleCreate}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all"
                    >
                        <Plus size={20} /> Add Ingredient
                    </button>
                </div>
            </div>

            {/* Main Content */}
            {activeTab === 'stock' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {ingredients.map(item => (
                        <div key={item.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col justify-between group hover:border-zinc-700 transition-all">
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-lg">{item.name}</h3>
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${item.currentStock <= item.minStock ? 'bg-red-500/20 text-red-500 animate-pulse' : 'bg-green-500/10 text-green-500'
                                        }`}>
                                        {item.currentStock <= item.minStock ? 'Low Stock' : 'Good'}
                                    </span>
                                </div>
                                <div className="flex items-baseline gap-1 mt-2">
                                    <span className="text-4xl font-mono font-bold">{item.currentStock}</span>
                                    <span className="text-zinc-500 font-bold">{item.unit}</span>
                                </div>
                                <div className="text-xs text-zinc-500 mt-2 space-y-1">
                                    <div>Min: {item.minStock} {item.unit} | Cost: {item.costPerUnit} AED</div>
                                    {insights[item.id] && insights[item.id].dailyBurnRate > 0 && (
                                        <div className={`font-bold ${insights[item.id].status === 'critical' ? 'text-red-500' :
                                            insights[item.id].status === 'warning' ? 'text-yellow-500' : 'text-blue-500'}`}>
                                            Daily Burn: {insights[item.id].dailyBurnRate.toFixed(1)} {item.unit}
                                            <span className="mx-2">•</span>
                                            {insights[item.id].daysUntilEmpty > 100 ? '> 100 Days' :
                                                `${insights[item.id].daysUntilEmpty.toFixed(1)} Days Left`}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="border-t border-zinc-800 mt-4 pt-4 flex gap-2">
                                <button
                                    onClick={() => handleRestock(item)}
                                    className="flex-1 bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2"
                                >
                                    <Plus size={14} /> Restock
                                </button>
                                <button
                                    onClick={() => handleWastage(item)}
                                    className="flex-1 bg-orange-900/40 hover:bg-orange-900/60 text-orange-500 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 border border-orange-900/50"
                                >
                                    <AlertTriangle size={14} /> Waste
                                </button>
                                <div className="w-px bg-zinc-800 mx-1"></div>
                                <button
                                    onClick={() => handleEdit(item)}
                                    className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2"
                                >
                                    <Edit2 size={14} />
                                </button>
                                <button
                                    onClick={() => handleDelete(item.id, item.name)}
                                    className="bg-zinc-800 hover:bg-red-900/30 hover:text-red-500 text-zinc-300 py-2 px-3 rounded-lg flex items-center justify-center transition-colors"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}

                    {ingredients.length === 0 && (
                        <div className="col-span-full text-center py-20 opacity-50">
                            <h3 className="text-xl font-bold">No Ingredients Found</h3>
                            <p>Add your first ingredient to start tracking inventory.</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-zinc-950 text-zinc-400 text-xs uppercase font-bold">
                            <tr>
                                <th className="p-4">Time</th>
                                <th className="p-4">Ingredient</th>
                                <th className="p-4">Type</th>
                                <th className="p-4 text-right">Change</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800 text-sm">
                            {transactions.map(tx => {
                                const ingredientName = ingredients.find(i => i.id === tx.ingredientId)?.name || 'Unknown'
                                return (
                                    <tr key={tx.id} className="hover:bg-white/5">
                                        <td className="p-4 font-mono text-zinc-500">
                                            {tx.createdAt?.seconds ? new Date(tx.createdAt.seconds * 1000).toLocaleString() : 'Just now'}
                                        </td>
                                        <td className="p-4 font-bold">{ingredientName}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold ${tx.type === 'restock' ? 'bg-green-500/10 text-green-500' :
                                                tx.type === 'order' ? 'bg-blue-500/10 text-blue-500' :
                                                    'bg-zinc-800 text-zinc-400'
                                                }`}>
                                                {tx.type}
                                            </span>
                                        </td>
                                        <td className={`p-4 text-right font-mono font-bold ${tx.quantity > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                            {tx.quantity > 0 ? '+' : ''}{tx.quantity}
                                        </td>
                                    </tr>
                                )
                            })}
                            {transactions.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-zinc-500 italic">No transactions recorded yet</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}


            {/* Restock Modal */}
            {isRestocking && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-sm overflow-hidden text-center">
                        <div className="p-4 border-b border-zinc-800 bg-zinc-950">
                            <h3 className="font-bold text-white">Restock {restockForm.name}</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Add Quantity (+)</label>
                                <input
                                    type="number"
                                    autoFocus
                                    className="w-full bg-black border border-zinc-700 rounded p-4 text-center text-3xl font-mono text-green-500 focus:border-green-500 outline-none"
                                    value={restockForm.amount}
                                    onChange={e => setRestockForm({ ...restockForm, amount: parseFloat(e.target.value) || 0 })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">New Cost / Unit (Optional Update)</label>
                                <input
                                    type="number"
                                    className="w-full bg-black border border-zinc-700 rounded p-2 text-center text-zinc-400 focus:border-green-500 outline-none"
                                    value={restockForm.cost}
                                    onChange={e => setRestockForm({ ...restockForm, cost: parseFloat(e.target.value) || 0 })}
                                />
                            </div>
                        </div>
                        <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex justify-center gap-4">
                            <button onClick={() => setIsRestocking(false)} className="px-4 py-2 rounded text-zinc-500 font-bold hover:text-white">Cancel</button>
                            <button onClick={submitRestock} className="px-8 py-2 bg-green-600 hover:bg-green-500 rounded font-bold text-white shadow-lg shadow-green-900/20">
                                Confirm Restock
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Wastage Modal */}
            {isWastage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-sm overflow-hidden text-center">
                        <div className="p-4 border-b border-zinc-800 bg-orange-950/20">
                            <h3 className="font-bold text-orange-500 flex items-center justify-center gap-2">
                                <AlertTriangle size={18} /> Log Waste: {restockForm.name}
                            </h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Waste Quantity (-)</label>
                                <input
                                    type="number"
                                    autoFocus
                                    className="w-full bg-black border border-zinc-700 rounded p-4 text-center text-3xl font-mono text-orange-500 focus:border-orange-500 outline-none"
                                    value={restockForm.amount}
                                    onChange={e => setRestockForm({ ...restockForm, amount: parseFloat(e.target.value) || 0 })}
                                />
                                <p className="text-xs text-zinc-600 mt-2">This will remove stock and log as loss.</p>
                            </div>
                        </div>
                        <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex justify-center gap-4">
                            <button onClick={() => setIsWastage(false)} className="px-4 py-2 rounded text-zinc-500 font-bold hover:text-white">Cancel</button>
                            <button onClick={submitWastage} className="px-8 py-2 bg-orange-600 hover:bg-orange-500 rounded font-bold text-white shadow-lg shadow-orange-900/20">
                                Confirm Waste
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create/Edit Modal */}
            {isCreating && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md overflow-hidden">
                        <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-950">
                            <h3 className="font-bold text-white">{editingId ? 'Edit Ingredient' : 'New Ingredient'}</h3>
                            <button onClick={() => setIsCreating(false)}><X className="text-zinc-500 hover:text-white" /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Name</label>
                                <input
                                    className="w-full bg-black border border-zinc-700 rounded p-3 text-white focus:border-blue-500 outline-none"
                                    value={editForm.name}
                                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                    placeholder="e.g. Rice Noodles"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Current Stock</label>
                                    <input
                                        type="number"
                                        className="w-full bg-black border border-zinc-700 rounded p-3 text-white focus:border-blue-500 outline-none"
                                        value={editForm.currentStock}
                                        onChange={e => setEditForm({ ...editForm, currentStock: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Unit</label>
                                    <select
                                        className="w-full bg-black border border-zinc-700 rounded p-3 text-white focus:border-blue-500 outline-none"
                                        value={editForm.unit}
                                        onChange={e => setEditForm({ ...editForm, unit: e.target.value as any })}
                                    >
                                        <option value="kg">kg</option>
                                        <option value="g">g</option>
                                        <option value="l">l</option>
                                        <option value="ml">ml</option>
                                        <option value="pcs">pcs</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Min Alert</label>
                                    <input
                                        type="number"
                                        className="w-full bg-black border border-zinc-700 rounded p-3 text-white focus:border-blue-500 outline-none"
                                        value={editForm.minStock}
                                        onChange={e => setEditForm({ ...editForm, minStock: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Cost / Unit</label>
                                    <input
                                        type="number"
                                        className="w-full bg-black border border-zinc-700 rounded p-3 text-white focus:border-blue-500 outline-none"
                                        value={editForm.costPerUnit}
                                        onChange={e => setEditForm({ ...editForm, costPerUnit: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex justify-end gap-2">
                            <button onClick={() => setIsCreating(false)} className="px-4 py-2 rounded text-zinc-400 font-bold hover:text-white">Cancel</button>
                            <button onClick={handleSave} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded font-bold text-white flex items-center gap-2">
                                <Save size={16} /> Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
