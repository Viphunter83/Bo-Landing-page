
export interface DeliveryZone {
    id: string;
    name: string;
    fee: number;
    minOrder: number;
    freeDeliveryThreshold?: number;
}

export const DEFAULT_ZONES: DeliveryZone[] = [
    {
        id: 'downtown',
        name: 'Downtown (Nearby)',
        fee: 10,
        minOrder: 50,
        freeDeliveryThreshold: 150
    },
    {
        id: 'city',
        name: 'City Limits (Standard)',
        fee: 25,
        minOrder: 100
    },
    {
        id: 'far',
        name: 'Far Areas',
        fee: 50,
        minOrder: 200
    }
];
