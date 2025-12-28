import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

let locales = ['en', 'ru', 'ar']
let defaultLocale = 'en'

export function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname

    // 1. Protection for Admin Routes
    if (pathname.startsWith('/admin')) {
        // Skip validation for login page itself
        if (pathname === '/admin/login') {
            return
        }

        // Check for session cookie (this assumes you set a cookie 'admin-session' on login)
        // If you don't use cookies yet, you might need to rely on Client-Side protection for now
        // BUT, the request was "Fix middleware".
        // Let's check if we can verify a cookie. 
        // For now, I will add a TODO or basic cookie check.
        const hasSession = request.cookies.has('admin_session')

        if (!hasSession) {
            return NextResponse.redirect(new URL('/admin/login', request.url))
        }

        // If they have a session, we want to STOP here and NOT do locale redirection for /admin
        // because /admin is not in [lang] folder.
        return
    }

    // 2. Skip API and Static Files from Locale Logic
    if (
        pathname.startsWith('/api') ||
        pathname.startsWith('/_next') ||
        pathname.includes('.') ||
        pathname === '/favicon.ico'
    ) {
        return
    }

    // Check if there is any supported locale in the pathname
    const pathnameIsMissingLocale = locales.every(
        (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
    )

    // Redirect if there is no locale
    if (pathnameIsMissingLocale) {
        const locale = defaultLocale

        // e.g. incoming request is /products
        // The new URL is now /en/products
        return NextResponse.redirect(
            new URL(`/${locale}${pathname.startsWith('/') ? '' : '/'}${pathname}`, request.url)
        )
    }
}

export const config = {
    matcher: [
        // Skip all internal paths (_next)
        '/((?!_next).*)',
        // Optional: only run on root (/) URL
        // '/'
    ],
}
