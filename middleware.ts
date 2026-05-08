import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
export function middleware(request: NextRequest) {
    try {
        const url = request.nextUrl.clone()
        const { pathname } = url

        // Diagnostic logs
        console.log(`[Middleware] Path: ${pathname}`);
        console.log(`[Middleware] NEXT_PUBLIC_TENANT_ID: ${process.env.NEXT_PUBLIC_TENANT_ID}`);
        
        // 1. Handle root path redirection to default language
        if (pathname === '/') {
            const defaultLang = 'en' // Hardcoded for diagnostic
            console.log(`[Middleware] Redirecting root to /${defaultLang}`);
            url.pathname = `/${defaultLang}`
            return NextResponse.redirect(url)
        }

        // 2. Protect /admin routes
        if (pathname.startsWith('/admin')) {
            const session = request.cookies.get('bo_session')

            if (!session && pathname !== '/admin/login') {
                url.pathname = '/admin/login'
                url.searchParams.set('redirect', pathname)
                return NextResponse.redirect(url)
            }
        }

        return NextResponse.next()
    } catch (error) {
        console.error('[Middleware Error]:', error);
        // Fallback to avoid 500 error
        return NextResponse.next();
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
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}


