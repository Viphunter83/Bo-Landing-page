export type OrderType = 'dine_in' | 'delivery' | 'pickup' | 'online_order';

export type OrderStatus =
    | 'pending'
    | 'new'
    | 'confirmed'
    | 'cooking'
    | 'ready'
    | 'out_for_delivery'
    | 'delivered'
    | 'completed'
    | 'cancelled'
    | 'rejected';

export interface UnifiedOrder {
    id: string;
    dataSource: 'booking' | 'order';
    type: OrderType;
    status: OrderStatus;

    // Customer Info
    name: string;
    phone: string;
    email?: string;
    address?: string; // Delivery only

    // Time & Date
    date: string; // YYYY-MM-DD or Display String
    time: string; // HH:mm
    createdAt: any; // Firestore Timestamp

    // Order Content
    items: any[] | string; // Array of objects or simple string note
    guests?: number; // Dine-in only
    notes?: string;
    specialRequests?: string;
    total?: number;

    // Internal
    driverId?: string;
    deliveryStatus?: string;
}

export const ORDER_STATUSES: { value: OrderStatus; label: string }[] = [
    { value: 'pending', label: 'Pending' },
    { value: 'new', label: 'New' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'cooking', label: 'In Kitchen' },
    { value: 'ready', label: 'Ready' },
    { value: 'out_for_delivery', label: 'Delivering' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
];

export const ORDER_TYPES: { value: OrderType; label: string }[] = [
    { value: 'dine_in', label: 'Dine In' },
    { value: 'delivery', label: 'Delivery' },
    { value: 'pickup', label: 'Pickup' },
    { value: 'online_order', label: 'Online Order' }
];
