import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    try {
        const url = request.nextUrl.clone()
        const { pathname } = url

        // console.log(`[Middleware] Request path: ${pathname}`)

        // 1. Handle root path by rewriting to default language
        if (pathname === '/') {
            const tenantId = process.env.NEXT_PUBLIC_TENANT_ID || 'luna_hcmc'
            const defaultLang = tenantId === 'luna_hcmc' ? 'vn' : 'en'
            
            url.pathname = `/${defaultLang}`
            // console.log(`[Middleware] Root rewrite to /${defaultLang} for tenant ${tenantId}`)
            return NextResponse.rewrite(url)
        }

        // 2. Admin protection
        if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
            const session = request.cookies.get('bo_session')
            if (!session) {
                const loginUrl = new URL('/admin/login', request.url)
                loginUrl.searchParams.set('redirect', pathname)
                return NextResponse.redirect(loginUrl)
            }
        }

        return NextResponse.next()
    } catch (error) {
        console.error('[Middleware Runtime Error]:', error)
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
         * - .png, .jpg, .svg
         */
        '/((?!api|_next/static|_next/image|favicon.ico|images|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)',
    ],
}

