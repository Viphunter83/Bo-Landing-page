
import { NextResponse } from 'next/server';
import { db } from '../../../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { DEFAULT_CONFIG, RestaurantConfig, Booking } from '../../../lib/types/booking';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const date = searchParams.get('date');
        const guests = parseInt(searchParams.get('guests') || '2');

        if (!date) {
            return NextResponse.json({ success: false, error: 'Date is required' }, { status: 400 });
        }

        // 1. Get Config (In a real app, fetch from DB. For now, use defaults)
        const config: RestaurantConfig = DEFAULT_CONFIG;

        // 2. Fetch existing bookings for this date
        // Note: In a robust system, we might need to check adjacent dates if slots carry over midnight,
        // but for 12:00-23:00, checking the single date is usually sufficient.
        const bookingsRef = collection(db, 'bookings');
        const q = query(
            bookingsRef,
            where('date', '==', date),
            where('status', '!=', 'cancelled')
        );

        const querySnapshot = await getDocs(q);
        const bookings: Booking[] = querySnapshot.docs.map(doc => doc.data() as Booking);

        // 3. Generate all slots
        const slots = generateTimeSlots(config.openingTime, config.closingTime, config.intervalMinutes);

        // 4. Calculate availability for each slot
        const availableSlots = slots.map(time => {
            // Calculate how many tables are occupied at this specific time
            const activeTables = bookings.reduce((count, booking) => {
                if (isBookingActiveAtTime(booking.time, time, config.slotDurationMinutes)) {
                    // Simplification: 1 booking = 1 table. 
                    // Advanced: If guests > 4, might take 2 tables.
                    const tablesNeeded = Math.ceil(booking.guests / 4);
                    return count + tablesNeeded;
                }
                return count;
            }, 0);

            const requestedTables = Math.ceil(guests / 4);
            const tablesLeft = config.totalTables - activeTables;

            return {
                time,
                available: tablesLeft >= requestedTables,
                tablesLeft
            };
        });

        return NextResponse.json({ success: true, slots: availableSlots });

    } catch (error) {
        console.error('Availability API Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}

// Helpers

function generateTimeSlots(start: string, end: string, interval: number): string[] {
    const slots: string[] = [];
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);

    let current = new Date();
    current.setHours(startH, startM, 0, 0);

    const endTime = new Date();
    endTime.setHours(endH, endM, 0, 0);

    // We stop slightly before closing time to allow for the last seating? 
    // Usually last seating is like 1 hour before close.
    // Let's assume 'closingTime' is the time the restaurant closes, so last booking should be at least 60 mins before.
    const lastSeating = new Date(endTime.getTime() - 60 * 60 * 1000);

    while (current <= lastSeating) {
        const h = current.getHours().toString().padStart(2, '0');
        const m = current.getMinutes().toString().padStart(2, '0');
        slots.push(`${h}:${m}`);
        current.setMinutes(current.getMinutes() + interval);
    }

    return slots;
}

function isBookingActiveAtTime(bookingTime: string, targetTime: string, durationMinutes: number): boolean {
    const [bH, bM] = bookingTime.split(':').map(Number);
    const [tH, tM] = targetTime.split(':').map(Number);

    const bookingStart = bH * 60 + bM;
    const bookingEnd = bookingStart + durationMinutes;
    const target = tH * 60 + tM;

    // A table is occupied if the target time falls within [start, end)
    // But wait, if I want to book at 13:00, I need to know if a table is free AT 13:00.
    // A booking at 12:00 (90 mins) occupies 12:00 - 13:30.
    // So yes, at 13:00, that table is occupied.
    return target >= bookingStart && target < bookingEnd;
}
