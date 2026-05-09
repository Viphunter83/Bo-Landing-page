import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { DEFAULT_ZONES, DeliveryZone } from '../../../lib/types/delivery';
import { getTenantConfig } from '../../../lib/firebase/tenant';

// MVP: In-memory state for rush mode per tenant.
// In prod, this should be in Firestore under tenants/{tenantId}/status
const rushModeState: Record<string, boolean> = {};

export async function GET() {
    const headersList = headers();
    const tenantId = headersList.get('x-tenant-id') || process.env.NEXT_PUBLIC_TENANT_ID || 'bo_dubai';
    const tenantConfig = await getTenantConfig(tenantId);

    const isRushMode = rushModeState[tenantId] || false;

    let zones: DeliveryZone[] = DEFAULT_ZONES;

    // Scale zones based on currency/tenant if they are not defined in DB
    // Luna (VND) needs much higher numbers
    if (tenantId === 'luna_hcmc') {
        zones = [
            { id: 'district1', name: 'District 1 / 3 (Nearby)', fee: 30000, minOrder: 200000, freeDeliveryThreshold: 500000 },
            { id: 'hcmc', name: 'HCMC (Standard)', fee: 60000, minOrder: 500000 },
            { id: 'suburbs', name: 'Suburbs', fee: 150000, minOrder: 1000000 }
        ];
    }

    // Apply multiplier if rush mode
    const finalZones = zones.map(z => ({
        ...z,
        fee: isRushMode ? Math.ceil(z.fee * 1.5) : z.fee,
        isSurge: isRushMode
    }));

    return NextResponse.json({
        success: true,
        zones: finalZones,
        isRushMode,
        multiplier: isRushMode ? 1.5 : 1,
        currency: tenantConfig?.localization.currency.symbol || 'AED'
    });
}

export async function POST(req: Request) {
    try {
        const headersList = headers();
        const tenantId = headersList.get('x-tenant-id') || process.env.NEXT_PUBLIC_TENANT_ID || 'bo_dubai';
        
        const body = await req.json();
        if (typeof body.rushMode === 'boolean') {
            rushModeState[tenantId] = body.rushMode;
        }
        return NextResponse.json({ success: true, isRushMode: rushModeState[tenantId], tenantId });
    } catch (e) {
        return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
    }
}
