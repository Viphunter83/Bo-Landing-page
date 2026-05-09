import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * LUNA & CO HCMC - Multi-tenant Middleware
 * 
 * IMPORTANT: We avoid importing the full tenantConfig here to prevent 500 errors 
 * in the Next.js Edge Runtime, which can be sensitive to large dependency trees.
 */

export function middleware(request: NextRequest) {
    try {
        const url = request.nextUrl.clone()
        const { pathname } = url

        // Diagnostic Logging (visible in Vercel logs)
        // console.log(`[Middleware] Processing path: ${pathname}`);

        // 1. Handle root path by rewriting to default language
        if (pathname === '/') {
            const tenantId = process.env.NEXT_PUBLIC_TENANT_ID
            // Luna HCMC defaults to Vietnamese, Bo Dubai defaults to English
            const defaultLang = tenantId === 'luna_hcmc' ? 'vn' : 'en'
            
            url.pathname = `/${defaultLang}`
            // console.log(`[Middleware] Rewriting / to /${defaultLang} for tenant ${tenantId}`);
            return NextResponse.rewrite(url)
        }

        // 2. Protect /admin routes (except login)
        if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
            const session = request.cookies.get('bo_session')

            if (!session) {
                console.log(`[Middleware] Unauthenticated access to ${pathname}, redirecting to login`);
                const loginUrl = new URL('/admin/login', request.url)
                loginUrl.searchParams.set('redirect', pathname)
                return NextResponse.redirect(loginUrl)
            }
        }

        return NextResponse.next()
    } catch (error) {
        // Fallback to next() to ensure the site stays up even if middleware fails
        console.error('[Middleware Error]:', error)
        return NextResponse.next()
    }
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - images (static assets)
         * - logo.png, luna-logo.png
         */
        '/((?!api|_next/static|_next/image|favicon.ico|images|logo.png|luna-logo.png).*)',
    ],
}
