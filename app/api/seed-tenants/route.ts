import { NextResponse } from 'next/server';
import { getAdminDb } from '@/app/lib/firebase-admin';
import { boConfig, lunaConfig } from '@/app/lib/config/tenant';

export async function GET() {
    try {
        const db = getAdminDb();
        const boRef = db.collection('tenants').doc(boConfig.id);
        const lunaRef = db.collection('tenants').doc(lunaConfig.id);

        await boRef.set(boConfig);
        await lunaRef.set(lunaConfig);

        return NextResponse.json({ success: true, message: 'Tenants seeded successfully' });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message });
    }
}
