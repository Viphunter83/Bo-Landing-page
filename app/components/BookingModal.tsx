'use client'

import { useState } from 'react'
import { X, Calendar, Clock, Users, Phone, Mail, CheckCircle } from 'lucide-react'

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  lang: string
  t: any
}

import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'

export default function BookingModal({ isOpen, onClose, lang, t }: BookingModalProps) {
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    guests: '2',
    name: '',
    phone: '',
    email: '',
    specialRequests: ''
  })
  const [isSubmitted, setIsSubmitted] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation
    if (!formData.date || !formData.time || !formData.name || !formData.phone) return

    if (!db) {
      alert("System unavailable: Database not connected.")
      return
    }

    if (!db) {
      alert("System unavailable: Database not connected.")
      return
    }

    setIsSubmitted(true) // Show loading state if needed, or better validation feedback

    try {
      await addDoc(collection(db, 'bookings'), {
        ...formData,
        status: 'pending', // pending, confirmed, cancelled
        createdAt: serverTimestamp(),
        // Create a searchable timestamp for sorting
        bookingDateTime: new Date(`${formData.date}T${formData.time}`).toISOString()
      })

      // Success UI
      setIsSubmitted(true)

      // cleanup
      setTimeout(() => {
        setIsSubmitted(false)
        onClose()
        setFormData({
          date: '',
          time: '',
          guests: '2',
          name: '',
          phone: '',
          email: '',
          specialRequests: ''
        })
      }, 3000)

    } catch (error) {
      console.error("Error adding booking: ", error)
      alert("Failed to send booking. Please try again or call use directly.")
      setIsSubmitted(false)
    }

    // Send Telegram Notification (Non-blocking)
    fetch('/api/notifications/telegram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    }).catch(err => console.error("Failed to send telegram notification", err))
  }

  const isRTL = lang === 'ar'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className={`bg-zinc-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-yellow-500/20 ${isRTL ? 'text-right' : 'text-left'}`}>
        {/* Header */}
        <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 p-6 flex justify-between items-center">
          <h2 className="text-2xl md:text-3xl font-black text-white">
            {lang === 'en' ? 'Book a Table' : lang === 'ru' ? 'Бронь стола' : 'احجز طاولة'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-zinc-800 rounded-full"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        {isSubmitted ? (
          <div className="p-12 text-center">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="text-green-500" size={40} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">
              {lang === 'en' ? 'Booking Confirmed!' : lang === 'ru' ? 'Бронь подтверждена!' : 'تم تأكيد الحجز!'}
            </h3>
            <p className="text-gray-400">
              {lang === 'en'
                ? 'We will contact you shortly to confirm your reservation.'
                : lang === 'ru'
                  ? 'Мы свяжемся с вами в ближайшее время для подтверждения брони.'
                  : 'سنتصل بك قريباً لتأكيد حجزك.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Date & Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-gray-300 mb-2">
                  <Calendar size={18} className="text-yellow-500" />
                  <span>{lang === 'en' ? 'Date' : lang === 'ru' ? 'Дата' : 'التاريخ'}</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full bg-black border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-500"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-gray-300 mb-2">
                  <Clock size={18} className="text-yellow-500" />
                  <span>{lang === 'en' ? 'Time' : lang === 'ru' ? 'Время' : 'الوقت'}</span>
                </label>
                <select
                  required
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full bg-black border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-500"
                >
                  <option value="">{lang === 'en' ? 'Select time' : lang === 'ru' ? 'Выберите время' : 'اختر الوقت'}</option>
                  {['18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00', '22:30'].map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Guests */}
            <div>
              <label className="flex items-center gap-2 text-gray-300 mb-2">
                <Users size={18} className="text-yellow-500" />
                <span>{lang === 'en' ? 'Number of Guests' : lang === 'ru' ? 'Количество гостей' : 'عدد الضيوف'}</span>
              </label>
              <select
                required
                value={formData.guests}
                onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                className="w-full bg-black border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-500"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                  <option key={num} value={num.toString()}>
                    {num} {lang === 'en' ? 'guest' : lang === 'ru' ? 'гость' : 'ضيف'} {num > 1 && lang === 'en' ? 's' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-gray-300 mb-2">
                  <span>{lang === 'en' ? 'Full Name' : lang === 'ru' ? 'Полное имя' : 'الاسم الكامل'}</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-black border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-500"
                  placeholder={lang === 'en' ? 'John Doe' : lang === 'ru' ? 'Иван Иванов' : 'أحمد محمد'}
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-gray-300 mb-2">
                  <Phone size={18} className="text-yellow-500" />
                  <span>{lang === 'en' ? 'Phone' : lang === 'ru' ? 'Телефон' : 'الهاتف'}</span>
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-black border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-500"
                  placeholder="+971 50 123 4567"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-gray-300 mb-2">
                <Mail size={18} className="text-yellow-500" />
                <span>Email</span>
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-black border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-500"
                placeholder="your@email.com"
              />
            </div>

            {/* Special Requests */}
            <div>
              <label className="text-gray-300 mb-2 block">
                {lang === 'en' ? 'Special Requests' : lang === 'ru' ? 'Особые пожелания' : 'طلبات خاصة'}
              </label>
              <textarea
                value={formData.specialRequests}
                onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                rows={3}
                className="w-full bg-black border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-500 resize-none"
                placeholder={lang === 'en' ? 'Birthday celebration, dietary restrictions, etc.' : lang === 'ru' ? 'День рождения, диетические ограничения и т.д.' : 'احتفال عيد ميلاد، قيود غذائية، إلخ.'}
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-3 rounded-full font-bold transition-colors"
              >
                {lang === 'en' ? 'Cancel' : lang === 'ru' ? 'Отмена' : 'إلغاء'}
              </button>
              <button
                type="submit"
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-bold transition-colors shadow-lg shadow-red-600/30"
              >
                {lang === 'en' ? 'Confirm Booking' : lang === 'ru' ? 'Подтвердить бронь' : 'تأكيد الحجز'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}


