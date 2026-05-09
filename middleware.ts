import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl
    const tenantId = process.env.NEXT_PUBLIC_TENANT_ID || 'luna_hcmc'

    try {
        // 1. Handle root path by rewriting to default language
        if (pathname === '/') {
            const defaultLang = tenantId === 'luna_hcmc' ? 'vn' : 'en'
            const url = request.nextUrl.clone()
            url.pathname = `/${defaultLang}`
            
            console.log(`[Middleware] Rewriting root to /${defaultLang} (Tenant: ${tenantId})`)
            return NextResponse.rewrite(url)
        }

        // 2. Admin protection
        if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
            const session = request.cookies.get('bo_session')
            if (!session) {
                console.log(`[Middleware] Admin access denied, redirecting to login. Path: ${pathname}`)
                const loginUrl = new URL('/admin/login', request.url)
                loginUrl.searchParams.set('redirect', pathname)
                return NextResponse.redirect(loginUrl)
            }
        }

        return NextResponse.next()
    } catch (error) {
        // Log error details for Vercel logs
        console.error('[Middleware Critical Error]:', {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            path: pathname,
            tenant: tenantId
        })
        
        // Fallback to normal execution instead of crashing with 500
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
         * - manifest.webmanifest, sitemap.xml, robots.txt
         * - common static extensions: .png, .jpg, .jpeg, .gif, .svg, .webp, .ico, .woff, .woff2, .mp4
         */
        '/((?!api|_next/static|_next/image|favicon.ico|images|manifest\\.webmanifest|sitemap\\.xml|robots\\.txt|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$|.*\\.webp$|.*\\.ico$|.*\\.woff$|.*\\.woff2$|.*\\.mp4$).*)',
    ],
}

