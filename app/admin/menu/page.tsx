'use client'

import { useEffect, useState } from 'react'
import { collection, query, orderBy, onSnapshot, doc, updateDoc, addDoc, deleteDoc } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { Edit2, Plus, Trash2, Scale } from 'lucide-react'
import Image from 'next/image'
import ImageUpload from '../../components/ImageUpload'
import { useToast } from '../context/ToastContext'
import AdminDataTable from '../components/AdminDataTable'
import { Ingredient, RecipeItem } from '../../lib/types/inventory'
import AdminHelp from '../components/AdminHelp'


export const dynamic = 'force-dynamic'

export default function MenuManager() {
    const [items, setItems] = useState<any[]>([])
    const [ingredients, setIngredients] = useState<Ingredient[]>([])
    const [editingId, setEditingId] = useState<string | null>(null)
    const [isCreating, setIsCreating] = useState(false)
    const [editForm, setEditForm] = useState<any>({})
    const { showToast } = useToast()

    useEffect(() => {
        if (!db) return

        // Fetch Menu Items
        const qMenu = query(collection(db, 'menu_items'), orderBy('category'))
        const unsubMenu = onSnapshot(qMenu, (snapshot) => {
            setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
        })

        // Fetch Ingredients for Recipe Editor
        const qIngredients = query(collection(db, 'ingredients'), orderBy('name'))
        const unsubIngredients = onSnapshot(qIngredients, (snapshot) => {
            setIngredients(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ingredient)))
        })

        return () => {
            unsubMenu()
            unsubIngredients()
        }
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
            stock: 'in_stock',
            recipe: [] // { ingredientId, quantity }
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
                    <div className="flex items-center gap-3">
                        <h2 className="text-3xl font-bold mb-2">Menu Manager</h2>
                        <AdminHelp
                            pageName="Menu Manager"
                            content={{
                                ru: {
                                    title: "Управление Меню",
                                    steps: [
                                        "Список всех блюд с ценами и статусами.",
                                        "Add Item: Создать новое блюдо.",
                                        "Technical Card (Recipe): Внутри каждого блюда можно настроить состав (калькуляция).",
                                        "Stock Status: Переключатель 'IN STOCK' / 'SOLD OUT' для 86-листа."
                                    ],
                                    tips: [
                                        "Фотографии блюд грузятся по ссылке или через аплоад.",
                                        "Категории влияют на сортировку в основном меню."
                                    ]
                                },
                                en: {
                                    title: "Menu Manager",
                                    steps: [
                                        "Manage dishes, prices, and availability.",
                                        "Add Item: Create new menu items.",
                                        "Technical Card: Configure recipe ingredients for inventory tracking.",
                                        "Stock Status: Toggle 'IN STOCK' / 'SOLD OUT' instantly."
                                    ],
                                    tips: [
                                        "Photos: Use high-quality URL or upload directly.",
                                        "Categories follow the order on the customer site."
                                    ]
                                }
                            }}
                        />
                    </div>
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
                                        value={editForm.description?.en || ''}
                                        onChange={e => setEditForm({ ...editForm, description: { ...editForm.description, en: e.target.value, ru: editForm.description?.ru || '', ar: editForm.description?.ar || '' } })}
                                        className="w-full bg-black border border-zinc-700 rounded p-3 text-white focus:border-red-600 outline-none h-24"
                                    />
                                </div>

                                {/* Recipe / Tech Card Section */}
                                <div className="col-span-2 border-t border-zinc-800 pt-6 mt-2">
                                    <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                        <Scale size={20} className="text-blue-500" /> Technical Card (Recipe)
                                    </h4>

                                    <div className="bg-zinc-950 rounded-xl p-4 border border-zinc-800 space-y-3">
                                        {(editForm.recipe || []).map((rItem: RecipeItem, idx: number) => {
                                            const ing = ingredients.find(i => i.id === rItem.ingredientId)
                                            return (
                                                <div key={idx} className="flex items-center gap-3 bg-zinc-900/50 p-2 rounded border border-zinc-800">
                                                    <div className="flex-1 text-sm font-bold text-zinc-300">
                                                        {ing?.name || 'Unknown Ingredient'}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="number"
                                                            className="w-20 bg-black border border-zinc-700 rounded p-1 text-sm text-center text-white outline-none focus:border-blue-500"
                                                            value={rItem.quantity}
                                                            onChange={(e) => {
                                                                const val = parseFloat(e.target.value) || 0
                                                                const newRecipe = [...(editForm.recipe || [])]
                                                                newRecipe[idx].quantity = val
                                                                setEditForm({ ...editForm, recipe: newRecipe })
                                                            }}
                                                        />
                                                        <span className="text-xs text-zinc-500 font-mono w-8">{ing?.unit}</span>
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            const newRecipe = [...(editForm.recipe || [])]
                                                            newRecipe.splice(idx, 1)
                                                            setEditForm({ ...editForm, recipe: newRecipe })
                                                        }}
                                                        className="text-zinc-600 hover:text-red-500 p-1"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            )
                                        })}

                                        {/* Add Ingredient Row */}
                                        <div className="flex gap-2 mt-2">
                                            <select
                                                className="flex-1 bg-zinc-900 border border-zinc-700 rounded p-2 text-sm text-zinc-400 outline-none focus:border-blue-500"
                                                id="new-ingredient-select"
                                                onChange={(e) => {
                                                    if (!e.target.value) return
                                                    const newRecipe = [...(editForm.recipe || [])]
                                                    newRecipe.push({
                                                        ingredientId: e.target.value,
                                                        quantity: 0
                                                    })
                                                    setEditForm({ ...editForm, recipe: newRecipe })
                                                    // Reset select
                                                    e.target.value = ""
                                                }}
                                            >
                                                <option value="">+ Add Ingredient...</option>
                                                {ingredients
                                                    .filter(i => !(editForm.recipe || []).find((r: RecipeItem) => r.ingredientId === i.id))
                                                    .map(i => (
                                                        <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>
                                                    ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Cost Estimation */}
                                    <div className="flex justify-end mt-2 text-xs text-zinc-500">
                                        Estimated Cost: <span className="text-white font-mono font-bold ml-1">
                                            {(editForm.recipe || []).reduce((acc: number, item: RecipeItem) => {
                                                const ing = ingredients.find(i => i.id === item.ingredientId)
                                                return acc + (item.quantity * (ing?.costPerUnit || 0))
                                            }, 0).toFixed(2)} AED
                                        </span>
                                    </div>
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

