
export interface Booking {
    id?: string;
    date: string; // YYYY-MM-DD
    time: string; // HH:mm
    guests: number;
    name: string;
    phone: string;
    email?: string;
    specialRequests?: string;
    status: 'pending' | 'confirmed' | 'cancelled';
    createdAt?: any;
}

export interface RestaurantConfig {
    totalTables: number; // e.g., 10
    slotDurationMinutes: number; // e.g., 90
    openingTime: string; // "12:00"
    closingTime: string; // "23:00"
    intervalMinutes: number; // e.g. 30 (slots at 12:00, 12:30, etc.)
}

export interface BookingSlot {
    time: string;
    available: boolean;
    tablesLeft: number;
}

export const DEFAULT_CONFIG: RestaurantConfig = {
    totalTables: 10,
    slotDurationMinutes: 90,
    openingTime: "12:00",
    closingTime: "23:00",
    intervalMinutes: 30
};
