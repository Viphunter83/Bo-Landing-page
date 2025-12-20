'use client'

import React, { useState } from 'react'
import { X, Calendar, Clock, Users, Phone, Mail, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react'

import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  lang: string
  t: any
}

// Localization Helpers
const DAYS = {
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  ru: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
  ar: ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت']
}

const MONTHS = {
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  ru: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
  ar: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
}

export default function BookingModal({ isOpen, onClose, lang, t }: BookingModalProps) {
  const [formData, setFormData] = useState({
    date: '', // ISO YYYY-MM-DD
    time: '',
    guests: '2',
    name: '',
    phone: '',
    email: '',
    specialRequests: ''
  })

  // Calendar State
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const [isSubmitted, setIsSubmitted] = useState(false)
  const [availableSlots, setAvailableSlots] = useState<{ time: string, available: boolean }[]>([])
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)


  // Fetch Slots
  React.useEffect(() => {
    const fetchSlots = async () => {
      if (!formData.date) return

      setIsLoadingSlots(true)
      try {
        const res = await fetch(`/api/bookings/availability?date=${formData.date}&guests=${formData.guests}`)
        const data = await res.json()
        if (data.success) {
          setAvailableSlots(data.slots)
        } else {
          console.error("Failed to fetch slots:", data.error)
          setAvailableSlots([])
        }
      } catch (error) {
        console.error("Error fetching slots:", error)
        setAvailableSlots([])
      } finally {
        setIsLoadingSlots(false)
      }
    }

    fetchSlots()
  }, [formData.date, formData.guests])

  // Calendar Logic
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const days = new Date(year, month + 1, 0).getDate()
    const firstDay = new Date(year, month, 1).getDay()
    return { days, firstDay }
  }

  const handleDateClick = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    // Adjust for timezone offset to get correct YYYY-MM-DD
    const dateStr = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().split('T')[0]
    setFormData(prev => ({ ...prev, date: dateStr, time: '' })) // Reset time on date change
  }

  const changeMonth = (delta: number) => {
    const newDate = new Date(currentMonth)
    newDate.setMonth(newDate.getMonth() + delta)
    setCurrentMonth(newDate)
  }

  const isSelectedDate = (day: number) => {
    if (!formData.date) return false
    const d = new Date(formData.date)
    return d.getDate() === day && d.getMonth() === currentMonth.getMonth() && d.getFullYear() === currentMonth.getFullYear()
  }

  const isTodayOrFuture = (day: number) => {
    const checkDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return checkDate >= today
  }

  // ... (Keep existing handleSubmit) - Restoring logic
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation
    if (!formData.date || !formData.time || !formData.name || !formData.phone) return

    if (!db) {
      alert("System unavailable: Database not connected.")
      return
    }

    setIsSubmitted(true)

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
      body: JSON.stringify({
        ...formData,
        type: 'dine_in',
        source: 'web'
      })
    }).catch(err => console.error("Failed to send telegram notification", err))

    // Send Email Confirmation (Non-blocking)
    if (formData.email) {
      fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'booking',
          to: formData.email,
          subject: lang === 'ru' ? 'Бронь подтверждена! 🗓️' : 'Table Reservation Confirmed! 🗓️',
          data: formData
        })
      }).catch(err => console.error("Failed to send email", err))
    }
  }

  // ... rest of component logic ...

  const { days: totalDays, firstDay } = getDaysInMonth(currentMonth)
  const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1)
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i)

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`bg-zinc-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-yellow-500/20 shadow-2xl relative ${lang === 'ar' ? 'text-right' : 'text-left'}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-zinc-900/95 backdrop-blur border-b border-zinc-800 p-6 flex justify-between items-center z-20">
          <h2 className="text-2xl font-black text-white">
            {lang === 'en' ? 'Book a Table' : lang === 'ru' ? 'Бронь стола' : 'احجز طاولة'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors p-2 hover:bg-zinc-800 rounded-full active:scale-95 z-30"
          >
            <X size={24} />
          </button>
        </div>

        {isSubmitted ? (
          // ... (Keep Success State)
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
          <form onSubmit={handleSubmit} className="p-6 space-y-8">

            {/* 1. Date Selection (Calendar) */}
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <label className="flex items-center gap-2 text-white font-bold text-lg">
                  <Calendar size={20} className="text-yellow-500" />
                  <span>{lang === 'en' ? 'Select Date' : lang === 'ru' ? 'Выберите дату' : 'اختر التاريخ'}</span>
                </label>
                <div className="flex items-center gap-2 bg-zinc-800 rounded-lg p-1">
                  <button type="button" onClick={() => changeMonth(-1)} className="p-1 hover:bg-zinc-700 rounded text-white"><ChevronLeft size={20} /></button>
                  <span className="text-sm font-bold text-white w-24 text-center">
                    {MONTHS[lang as keyof typeof MONTHS]?.[currentMonth.getMonth()] || MONTHS['en'][currentMonth.getMonth()]} {currentMonth.getFullYear()}
                  </span>
                  <button type="button" onClick={() => changeMonth(1)} className="p-1 hover:bg-zinc-700 rounded text-white"><ChevronRight size={20} /></button>
                </div>
              </div>

              <div className="bg-black/50 border border-zinc-800 rounded-xl p-4">
                {/* Weekdays */}
                <div className="grid grid-cols-7 mb-2">
                  {(DAYS[lang as keyof typeof DAYS] || DAYS['en']).map((day, i) => (
                    <div key={i} className="text-center text-xs text-zinc-500 font-bold uppercase py-2">
                      {day}
                    </div>
                  ))}
                </div>
                {/* Days */}
                <div className="grid grid-cols-7 gap-1">
                  {emptyDays.map(i => <div key={`empty-${i}`} />)}
                  {daysArray.map(day => {
                    const isAvailable = isTodayOrFuture(day)
                    const selected = isSelectedDate(day)
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => isAvailable && handleDateClick(day)}
                        disabled={!isAvailable}
                        className={`
                                        h-10 rounded-lg text-sm font-bold transition-all flex items-center justify-center
                                        ${selected
                            ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20 scale-105'
                            : isAvailable
                              ? 'bg-zinc-800/50 text-white hover:bg-zinc-700 hover:scale-105'
                              : 'text-zinc-700 cursor-not-allowed'}
                                    `}
                      >
                        {day}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* 2. Time Selection (Slots Grid) */}
            <div className={`space-y-4 transition-all duration-300 ${!formData.date ? 'opacity-50 grayscale pointer-events-none' : 'opacity-100'}`}>
              <label className="flex items-center gap-2 text-white font-bold text-lg">
                <Clock size={20} className="text-yellow-500" />
                <span>{lang === 'en' ? 'Select Time' : lang === 'ru' ? 'Выберите время' : 'اختر الوقت'}</span>
              </label>

              {isLoadingSlots ? (
                <div className="text-center p-8 text-zinc-500 animate-pulse">
                  {lang === 'ru' ? 'Загрузка слотов...' : 'Loading slots...'}
                </div>
              ) : availableSlots.length > 0 ? (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {availableSlots.map(slot => (
                    <button
                      key={slot.time}
                      type="button"
                      disabled={!slot.available}
                      onClick={() => setFormData({ ...formData, time: slot.time })}
                      className={`
                                    py-2 px-1 rounded-lg text-sm font-bold border transition-all
                                    ${formData.time === slot.time
                          ? 'bg-white text-black border-white shadow-lg scale-105'
                          : slot.available
                            ? 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-yellow-500 hover:text-yellow-500'
                            : 'bg-zinc-900/50 border-zinc-800 text-zinc-700 cursor-not-allowed decoration-slice'}
                                `}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 text-zinc-500 border border-zinc-800 border-dashed rounded-xl">
                  {lang === 'ru' ? 'Нет свободных мест на эту дату' : 'No slots available for this date'}
                </div>
              )}
            </div>

            {/* 3. Guests & Contact */}
            <div className="bg-zinc-800/30 p-4 rounded-xl space-y-4 border border-zinc-800/50">
              {/* Guests */}
              <div>
                <label className="flex items-center gap-2 text-zinc-400 text-sm mb-2">
                  <Users size={16} />
                  <span>{lang === 'en' ? 'Guests' : lang === 'ru' ? 'Гости' : 'الضيوف'}</span>
                </label>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setFormData({ ...formData, guests: num.toString() })}
                      className={`
                            w-10 h-10 rounded-full flex-shrink-0 font-bold transition-all
                            ${formData.guests === num.toString()
                          ? 'bg-yellow-500 text-black'
                          : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'}
                        `}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-black border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-500 placeholder:text-zinc-600"
                  placeholder={lang === 'en' ? 'Full Name' : lang === 'ru' ? 'Имя' : 'الاسم'}
                />
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="bg-black border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-500 placeholder:text-zinc-600"
                  placeholder={lang === 'en' ? 'Phone' : lang === 'ru' ? 'Телефон' : 'الهاتف'}
                />
              </div>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-black border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-500 placeholder:text-zinc-600"
                placeholder="Email"
              />
              <textarea
                value={formData.specialRequests}
                onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                rows={2}
                className="w-full bg-black border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-500 resize-none placeholder:text-zinc-600"
                placeholder={lang === 'en' ? 'Special Requests...' : lang === 'ru' ? 'Пожелания...' : 'طلبات خاصة...'}
              />
            </div>


            {/* Submit Button */}
            <div className="flex gap-4 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-4 rounded-xl font-bold transition-colors"
              >
                {lang === 'en' ? 'Cancel' : lang === 'ru' ? 'Отмена' : 'إلغاء'}
              </button>
              <button
                type="submit"
                disabled={!formData.date || !formData.time || !formData.name}
                className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black px-6 py-4 rounded-xl font-bold transition-all shadow-lg shadow-yellow-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {lang === 'en' ? 'Confirm' : lang === 'ru' ? 'Подтвердить' : 'تأكيد'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}


