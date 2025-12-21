import { NextResponse } from 'next/server';
import { DEFAULT_ZONES } from '../../../lib/types/delivery';

// MVP: In-memory state. In prod this should be in DB/Redis.
// Since Vercel serverless functions are ephemeral, this will reset. 
// However, for this demo/MVP session on a running dev server or persistent container, it might hold.
// BETTER: Let's use Firestore to persist it properly if we can, or accept the ephemeral nature for now and warn user.
// actually, let's use a module variable but defaulted to false. If checking on dev server it persists until restart.
let isRushMode = false;

export async function GET() {
    // Apply multiplier if rush mode
    const zones = DEFAULT_ZONES.map(z => ({
        ...z,
        fee: isRushMode ? Math.ceil(z.fee * 1.5) : z.fee,
        isSurge: isRushMode
    }));

    return NextResponse.json({
        success: true,
        zones,
        isRushMode,
        multiplier: isRushMode ? 1.5 : 1
    });
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        if (typeof body.rushMode === 'boolean') {
            isRushMode = body.rushMode;
        }
        return NextResponse.json({ success: true, isRushMode });
    } catch (e) {
        return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
    }
}
