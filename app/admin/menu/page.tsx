'use client'

import { useEffect, useState } from 'react'
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { Search, Edit2, Save, X } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function MenuManager() {
    const [items, setItems] = useState<any[]>([])
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editForm, setEditForm] = useState<any>({})
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        const q = query(collection(db, 'menu_items'), orderBy('category'))
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
        })
        return () => unsubscribe()
    }, [])

    const handleEdit = (item: any) => {
        setEditingId(item.id)
        setEditForm({ ...item })
    }

    const handleSave = async () => {
        if (!editingId) return
        try {
            await updateDoc(doc(db, 'menu_items', editingId), {
                price: editForm.price,
                stock: editForm.stock || 'in_stock' // in_stock, out_of_stock
            })
            setEditingId(null)
        } catch (e) {
            console.error("Failed to update item", e)
            alert("Failed to save")
        }
    }

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold mb-2">Menu Manager</h2>
                    <p className="text-zinc-400">Manage prices and availability.</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                    <input
                        type="text"
                        placeholder="Search menu..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-red-600 w-64"
                    />
                </div>
            </div>

            <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
                <table className="w-full text-left text-sm text-zinc-400">
                    <thead className="bg-zinc-800/50 text-zinc-200 uppercase font-medium">
                        <tr>
                            <th className="p-4">Item</th>
                            <th className="p-4">Category</th>
                            <th className="p-4">Price</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                        {filteredItems.map((item) => (
                            <tr key={item.id} className="hover:bg-zinc-800/20 transition-colors">
                                <td className="p-4 font-medium text-white">{item.name}</td>
                                <td className="p-4">
                                    <span className="bg-zinc-800 text-zinc-300 px-2 py-1 rounded text-xs capitalize">
                                        {item.category}
                                    </span>
                                </td>
                                <td className="p-4">
                                    {editingId === item.id ? (
                                        <input
                                            type="text"
                                            value={editForm.price}
                                            onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                                            className="bg-black border border-zinc-700 rounded px-2 py-1 w-20 text-white"
                                        />
                                    ) : (
                                        item.price
                                    )}
                                </td>
                                <td className="p-4">
                                    {editingId === item.id ? (
                                        <select
                                            value={editForm.stock || 'in_stock'}
                                            onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })}
                                            className="bg-black border border-zinc-700 rounded px-2 py-1 text-white"
                                        >
                                            <option value="in_stock">In Stock</option>
                                            <option value="out_of_stock">Sold Out</option>
                                        </select>
                                    ) : (
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${item.stock === 'out_of_stock' ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'
                                            }`}>
                                            {item.stock === 'out_of_stock' ? 'SOLD OUT' : 'IN STOCK'}
                                        </span>
                                    )}
                                </td>
                                <td className="p-4 text-right">
                                    {editingId === item.id ? (
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={handleSave} className="text-green-500 hover:bg-green-500/10 p-1 rounded">
                                                <Save size={18} />
                                            </button>
                                            <button onClick={() => setEditingId(null)} className="text-red-500 hover:bg-red-500/10 p-1 rounded">
                                                <X size={18} />
                                            </button>
                                        </div>
                                    ) : (
                                        <button onClick={() => handleEdit(item)} className="text-zinc-500 hover:text-white transition-colors">
                                            <Edit2 size={18} />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {items.length === 0 && (
                    <div className="p-12 text-center">
                        <p className="text-zinc-500 mb-4">No items found.</p>
                        <p className="text-sm text-zinc-600">
                            Don&apos;t forget to run
                            <a href="/admin/migration" className="text-red-500 hover:underline mx-1">Migration</a>
                            to populate the database.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
