import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const { pathname, search } = request.nextUrl

    // 1. Handle root path redirection to default language
    if (pathname === '/') {
        // We can detect browser language or just use 'en' as default
        // To be safe and consistent with the previous logic, we use 'en'
        const url = new URL(`/en${search}`, request.url)
        return NextResponse.redirect(url)
    }

    // 2. Protect /admin routes
    if (pathname.startsWith('/admin')) {
        const session = request.cookies.get('bo_session')

        if (!session && pathname !== '/admin/login') {
            const loginUrl = new URL('/admin/login', request.url)
            loginUrl.searchParams.set('redirect', pathname)
            return NextResponse.redirect(loginUrl)
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


