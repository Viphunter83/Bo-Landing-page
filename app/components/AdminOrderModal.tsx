'use client'

import { useState } from 'react'
import { X, Calendar, Clock, User, Phone, MapPin, ShoppingBag, Truck, Check } from 'lucide-react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useToast } from '../admin/context/ToastContext'
import { OrderType, ORDER_TYPES } from '../lib/types/core'

interface OrderModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess?: () => void
}

export default function AdminOrderModal({ isOpen, onClose, onSuccess }: OrderModalProps) {
    const [isLoading, setIsLoading] = useState(false)
    const { showToast } = useToast()
    const [orderType, setOrderType] = useState<OrderType>('dine_in')
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
        guests: '1',
        address: '',
        items: '', // Simple text for now
        notes: ''
    })

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!db) {
            showToast("Database connection failed", "error")
            return
        }
        setIsLoading(true)

        try {
            const commonData = {
                name: formData.name,
                phone: formData.phone,
                notes: formData.items + (formData.notes ? `\nNote: ${formData.notes}` : ''),
                source: 'manual_admin',
                createdAt: serverTimestamp(),
                type: orderType
            }

            if (orderType === 'dine_in') {
                // Save to BOOKINGS
                await addDoc(collection(db, 'bookings'), {
                    ...commonData,
                    status: 'pending',
                    date: formData.date,
                    time: formData.time,
                    guests: parseInt(formData.guests),
                    specialRequests: formData.notes,
                    items: formData.items, // String OK for bookings
                    bookingDateTime: new Date(`${formData.date}T${formData.time}`).toISOString()
                })
            } else {
                // Save to ORDERS (Delivery/Pickup)
                // Normalize items for KDS (expects array)
                const normalizedItems = formData.items.split(',').map(i => ({
                    name: i.trim(),
                    quantity: 1,
                    price: 0
                })).filter(i => i.name)

                await addDoc(collection(db, 'orders'), {
                    ...commonData,
                    status: 'new', // KDS expects 'new'
                    address: formData.address,
                    items: normalizedItems.length > 0 ? normalizedItems : [{ name: 'Custom Order', quantity: 1 }],
                    total: 0, // Manual orders might not have calculated total yet
                    deliveryStatus: orderType === 'delivery' ? 'pending' : undefined
                })
            }

            showToast("Order created successfully", "success")
            onSuccess?.()
            onClose()
            // Reset form
            setFormData({
                name: '',
                phone: '',
                date: new Date().toISOString().split('T')[0],
                time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
                guests: '1',
                address: '',
                items: '',
                notes: ''
            })
        } catch (error) {
            console.error("Error creating order:", error)
            showToast("Failed to create order", "error")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-zinc-800 flex justify-between items-center sticky top-0 bg-zinc-900 z-10">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <ShoppingBag className="text-red-500" />
                        New Order
                    </h3>
                    <button onClick={onClose} className="text-zinc-500 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Order Type Selector */}
                    <div className="grid grid-cols-3 gap-2">
                        {ORDER_TYPES.filter(t => t.value !== 'online_order').map((type) => {
                            const Icon = type.value === 'dine_in' ? User : type.value === 'delivery' ? Truck : ShoppingBag
                            return (
                                <button
                                    key={type.value}
                                    type="button"
                                    onClick={() => setOrderType(type.value as OrderType)}
                                    className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all ${orderType === type.value
                                        ? 'bg-red-600 border-red-600 text-white'
                                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                                        }`}
                                >
                                    <Icon size={20} />
                                    <span className="text-sm font-medium">{type.label}</span>
                                </button>
                            )
                        })}
                    </div>

                    {/* Customer Info */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-medium text-zinc-500 uppercase">Customer</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                required
                                placeholder="Name"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="bg-black border border-zinc-800 rounded-lg p-3 text-white focus:border-red-600 outline-none"
                            />
                            <input
                                required
                                placeholder="Phone"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                className="bg-black border border-zinc-800 rounded-lg p-3 text-white focus:border-red-600 outline-none"
                            />
                        </div>
                        {orderType === 'delivery' && (
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 text-zinc-500" size={18} />
                                <input
                                    required
                                    placeholder="Delivery Address"
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full bg-black border border-zinc-800 rounded-lg pl-10 pr-3 py-3 text-white focus:border-red-600 outline-none"
                                />
                            </div>
                        )}
                    </div>

                    {/* Order Details */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-medium text-zinc-500 uppercase">Details</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="relative">
                                <Calendar className="absolute left-3 top-3 text-zinc-500" size={18} />
                                <input
                                    type="date"
                                    required
                                    value={formData.date}
                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full bg-black border border-zinc-800 rounded-lg pl-10 pr-3 py-3 text-white focus:border-red-600 outline-none"
                                />
                            </div>
                            <div className="relative">
                                <Clock className="absolute left-3 top-3 text-zinc-500" size={18} />
                                <input
                                    type="time"
                                    required
                                    value={formData.time}
                                    onChange={e => setFormData({ ...formData, time: e.target.value })}
                                    className="w-full bg-black border border-zinc-800 rounded-lg pl-10 pr-3 py-3 text-white focus:border-red-600 outline-none"
                                />
                            </div>
                        </div>

                        {orderType === 'dine_in' && (
                            <div>
                                <label className="text-xs text-zinc-500 mb-1 block">Guests</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={formData.guests}
                                    onChange={e => setFormData({ ...formData, guests: e.target.value })}
                                    className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white focus:border-red-600 outline-none"
                                />
                            </div>
                        )}

                        <div>
                            <label className="text-xs text-zinc-500 mb-1 block">Order Items / Notes</label>
                            <textarea
                                value={formData.items}
                                onChange={e => setFormData({ ...formData, items: e.target.value })}
                                rows={3}
                                placeholder={orderType === 'dine_in' ? "Special requests..." : "List of items (e.g. 2x Pho Bo, 1x Spring Rolls)"}
                                className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white focus:border-red-600 outline-none"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 rounded-lg text-zinc-400 hover:bg-zinc-800 font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2"
                        >
                            {isLoading ? 'Creating...' : (
                                <>
                                    <Check size={20} /> Create Order
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
