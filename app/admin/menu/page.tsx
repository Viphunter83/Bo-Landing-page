'use client'

import { useEffect, useState } from 'react'
import { collection, query, orderBy, onSnapshot, doc, updateDoc, addDoc, deleteDoc } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { Edit2, Plus, Trash2 } from 'lucide-react'
import Image from 'next/image'
import ImageUpload from '../../components/ImageUpload'
import { useToast } from '../context/ToastContext'
import AdminDataTable from '../components/AdminDataTable'

export const dynamic = 'force-dynamic'

export default function MenuManager() {
    const [items, setItems] = useState<any[]>([])
    const [editingId, setEditingId] = useState<string | null>(null)
    const [isCreating, setIsCreating] = useState(false)
    const [editForm, setEditForm] = useState<any>({})
    const { showToast } = useToast()

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
            showToast("Database connection failed", "error")
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
            showToast("Item saved successfully", "success")
        } catch (e) {
            console.error("Failed to save item", e)
            showToast("Failed to save item", "error")
        }
    }

    const handleDelete = async (id: string, name: string) => {
        if (!db) return
        if (!confirm(`Are you sure you want to delete "${name}"?`)) return
        try {
            await deleteDoc(doc(db, 'menu_items', id))
            showToast("Item deleted", "success")
        } catch (e) {
            console.error("Failed to delete", e)
            showToast("Failed to delete item", "error")
        }
    }

    const columns = [
        {
            header: "Image",
            cell: (item: any) => (
                <div className="w-12 h-12 relative rounded overflow-hidden bg-zinc-800">
                    {item.image ? (
                        <Image src={item.image} alt={item.name} fill className="object-cover" sizes="48px" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs">No Img</div>
                    )}
                </div>
            )
        },
        {
            header: "Name",
            accessorKey: "name" as keyof any,
            sortable: true,
            className: "font-medium text-white"
        },
        {
            header: "Category",
            accessorKey: "category" as keyof any,
            sortable: true,
            cell: (item: any) => (
                <span className="bg-zinc-800 text-zinc-300 px-2 py-1 rounded text-xs capitalize border border-zinc-700">
                    {item.category}
                </span>
            )
        },
        {
            header: "Price",
            accessorKey: "price" as keyof any,
            sortable: true
        },
        {
            header: "Status",
            accessorKey: "stock" as keyof any,
            sortable: true,
            cell: (item: any) => (
                <span className={`px-2 py-1 rounded text-xs font-bold ${item.stock === 'out_of_stock'
                    ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                    : 'bg-green-500/10 text-green-500 border border-green-500/20'
                    }`}>
                    {item.stock === 'out_of_stock' ? 'SOLD OUT' : 'IN STOCK'}
                </span>
            )
        }
    ]

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold mb-2">Menu Manager</h2>
                    <p className="text-zinc-400">Manage your menu items, prices, and availability.</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 font-bold"
                >
                    <Plus size={20} /> Add Item
                </button>
            </div>

            {/* Editor Modal is unchanged - kept separate from table */}
            {(editingId || isCreating) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        {/* ... (Modal Content - Keeping purely structural for brevity in replacement) ... */}
                        <div className="p-6 border-b border-zinc-800 flex justify-between items-center sticky top-0 bg-zinc-900 z-10">
                            {/* ... Header ... */}
                            {/* NOTE: I am re-implementing the modal content here because replace_content replaces everything in the range */}
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
                            {/* ... Form Fields ... */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-zinc-400 mb-2">Photo</label>
                                    <ImageUpload
                                        initialImage={editForm.image}
                                        onUpload={(url: string) => setEditForm({ ...editForm, image: url })}
                                    />
                                    {/* URL Input */}
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

            <AdminDataTable
                columns={columns}
                data={items}
                searchKeys={['name', 'category']}
                searchPlaceholder="Search dishes..."
                filters={[
                    {
                        key: 'category',
                        label: 'Category',
                        options: [
                            { value: 'classic', label: 'Classic' },
                            { value: 'spicy', label: 'Spicy' },
                            { value: 'fresh', label: 'Fresh' },
                            { value: 'drinks', label: 'Drinks' },
                            { value: 'desserts', label: 'Desserts' }
                        ]
                    },
                    {
                        key: 'stock',
                        label: 'Status',
                        options: [
                            { value: 'in_stock', label: 'In Stock' },
                            { value: 'out_of_stock', label: 'Sold Out' }
                        ]
                    }
                ]}
                actions={(item) => (
                    <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleEdit(item)} className="text-zinc-500 hover:text-white p-2 hover:bg-zinc-800 rounded transition-colors" title="Edit">
                            <Edit2 size={18} />
                        </button>
                        <button onClick={() => handleDelete(item.id, item.name)} className="text-zinc-500 hover:text-red-500 p-2 hover:bg-red-500/10 rounded transition-colors" title="Delete">
                            <Trash2 size={18} />
                        </button>
                    </div>
                )}
            />
        </div>
    )
}

// Helper icon component since X is used in modal
function X({ size }: { size: number }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
    )
}

