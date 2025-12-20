
import { NextResponse } from 'next/server';
import { DEFAULT_ZONES } from '../../../lib/types/delivery';

export async function GET() {
    // In the future, fetch from DB 'settings/delivery'
    return NextResponse.json({ success: true, zones: DEFAULT_ZONES });
}
