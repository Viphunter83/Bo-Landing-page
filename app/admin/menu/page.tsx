'use client'

import { useEffect, useState } from 'react'
import { collection, query, orderBy, onSnapshot, doc, updateDoc, addDoc, deleteDoc } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { Search, Edit2, Save, X, Plus, Trash2 } from 'lucide-react'
import Image from 'next/image'
import ImageUpload from '../../components/ImageUpload'

export const dynamic = 'force-dynamic'

export default function MenuManager() {
    const [items, setItems] = useState<any[]>([])
    const [editingId, setEditingId] = useState<string | null>(null)
    const [isCreating, setIsCreating] = useState(false)
    const [editForm, setEditForm] = useState<any>({})
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        if (!db) return

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

    const handleCreate = () => {
        setEditForm({
            name: '',
            price: '',
            category: 'classic',
            desc: '',
            image: '',
            stock: 'in_stock'
        })
        setIsCreating(true)
    }

    const handleSave = async () => {
        if (!db) {
            alert("Database connection failed")
            return
        }
        try {
            if (isCreating) {
                await addDoc(collection(db, 'menu_items'), editForm)
                setIsCreating(false)
            } else if (editingId) {
                await updateDoc(doc(db, 'menu_items', editingId), editForm)
                setEditingId(null)
            }
        } catch (e) {
            console.error("Failed to save item", e)
            alert("Failed to save")
        }
    }

    const handleDelete = async (id: string, name: string) => {
        if (!db) return
        if (!confirm(`Are you sure you want to delete "${name}"?`)) return
        try {
            await deleteDoc(doc(db, 'menu_items', id))
        } catch (e) {
            console.error("Failed to delete", e)
            alert("Failed to delete")
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
                    <p className="text-zinc-400">Manage your menu items, prices, and availability.</p>
                </div>
                <div className="flex gap-4">
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
                    <button
                        onClick={handleCreate}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                    >
                        <Plus size={20} /> Add Item
                    </button>
                </div>
            </div>

            {/* Editor Modal */}
            {(editingId || isCreating) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-zinc-800 flex justify-between items-center sticky top-0 bg-zinc-900 z-10">
                            <h3 className="text-xl font-bold text-white">
                                {isCreating ? 'Add New Dish' : 'Edit Dish'}
                            </h3>
                            <button
                                onClick={() => { setEditingId(null); setIsCreating(false); }}
                                className="text-zinc-500 hover:text-white"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-zinc-400 mb-2">Photo</label>
                                    <ImageUpload
                                        initialImage={editForm.image}
                                        onUpload={(url) => setEditForm({ ...editForm, image: url })}
                                    />
                                    <div className="relative mt-3">
                                        <div className="absolute inset-0 flex items-center">
                                            <span className="w-full border-t border-zinc-800" />
                                        </div>
                                        <div className="relative flex justify-center text-xs uppercase">
                                            <span className="bg-zinc-900 px-2 text-zinc-500">Or paste URL</span>
                                        </div>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="https://..."
                                        value={editForm.image || ''}
                                        onChange={(e) => setEditForm({ ...editForm, image: e.target.value })}
                                        className="w-full bg-black border border-zinc-700 rounded p-2 text-sm text-zinc-400 focus:border-red-600 outline-none mt-2"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-zinc-400 mb-2">Name (EN)</label>
                                    <input
                                        type="text"
                                        value={editForm.name || ''}
                                        onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                        className="w-full bg-black border border-zinc-700 rounded p-3 text-white focus:border-red-600 outline-none"
                                        placeholder="e.g. Pho Bo"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-400 mb-2">Price</label>
                                    <input
                                        type="text"
                                        value={editForm.price || ''}
                                        onChange={e => setEditForm({ ...editForm, price: e.target.value })}
                                        className="w-full bg-black border border-zinc-700 rounded p-3 text-white focus:border-red-600 outline-none"
                                        placeholder="e.g. 45 AED"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-400 mb-2">Category</label>
                                    <select
                                        value={editForm.category || 'classic'}
                                        onChange={e => setEditForm({ ...editForm, category: e.target.value })}
                                        className="w-full bg-black border border-zinc-700 rounded p-3 text-white focus:border-red-600 outline-none"
                                    >
                                        <option value="classic">Classic</option>
                                        <option value="spicy">Spicy</option>
                                        <option value="fresh">Fresh</option>
                                        <option value="drinks">Drinks</option>
                                        <option value="desserts">Desserts</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-400 mb-2">Status</label>
                                    <select
                                        value={editForm.stock || 'in_stock'}
                                        onChange={e => setEditForm({ ...editForm, stock: e.target.value })}
                                        className="w-full bg-black border border-zinc-700 rounded p-3 text-white focus:border-red-600 outline-none"
                                    >
                                        <option value="in_stock">In Stock</option>
                                        <option value="out_of_stock">Sold Out</option>
                                    </select>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-zinc-400 mb-2">Description (EN)</label>
                                    <textarea
                                        value={editForm.desc || ''}
                                        onChange={e => setEditForm({ ...editForm, desc: e.target.value })}
                                        rows={3}
                                        className="w-full bg-black border border-zinc-700 rounded p-3 text-white focus:border-red-600 outline-none"
                                        placeholder="Dish description..."
                                    />
                                </div>
                                {/* Add more fields for Ru/Ar later */}
                            </div>
                        </div>

                        <div className="p-6 border-t border-zinc-800 bg-zinc-900 sticky bottom-0 flex justify-end gap-3 z-10">
                            <button
                                onClick={() => { setEditingId(null); setIsCreating(false); }}
                                className="px-6 py-3 rounded-lg text-zinc-400 hover:text-white"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 font-bold"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
                <table className="w-full text-left text-sm text-zinc-400">
                    <thead className="bg-zinc-800/50 text-zinc-200 uppercase font-medium">
                        <tr>
                            <th className="p-4">Image</th>
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
                                <td className="p-4">
                                    <div className="w-12 h-12 relative rounded overflow-hidden bg-zinc-800">
                                        {item.image && (
                                            <Image src={item.image} alt={item.name} fill className="object-cover" />
                                        )}
                                    </div>
                                </td>
                                <td className="p-4 font-medium text-white">{item.name}</td>
                                <td className="p-4">
                                    <span className="bg-zinc-800 text-zinc-300 px-2 py-1 rounded text-xs capitalize">
                                        {item.category}
                                    </span>
                                </td>
                                <td className="p-4">{item.price}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${item.stock === 'out_of_stock' ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'
                                        }`}>
                                        {item.stock === 'out_of_stock' ? 'SOLD OUT' : 'IN STOCK'}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button onClick={() => handleEdit(item)} className="text-zinc-500 hover:text-white p-2 hover:bg-zinc-800 rounded transition-colors">
                                            <Edit2 size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(item.id, item.name)} className="text-zinc-500 hover:text-red-500 p-2 hover:bg-red-500/10 rounded transition-colors">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
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
