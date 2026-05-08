import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { tenantConfig } from './app/lib/config/tenant'

export function middleware(request: NextRequest) {
    const url = request.nextUrl.clone()
    const { pathname } = url

    // 1. Handle root path redirection to default language
    if (pathname === '/') {
        const defaultLang = tenantConfig.localization.defaultLang || 'en'
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


