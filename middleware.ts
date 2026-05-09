import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Поддерживаемые локали
const locales = ['en', 'ru', 'ar', 'vn']

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl
    
    // 1. Skip system paths and files
    if (
        pathname.startsWith('/api') ||
        pathname.startsWith('/_next') ||
        pathname.includes('.') || // matches favicon.ico, images, etc.
        pathname.startsWith('/admin')
    ) {
        return NextResponse.next()
    }

    // 2. Detect Tenant ID
    const tenantId = request.headers.get('x-tenant-id') || process.env.NEXT_PUBLIC_TENANT_ID || 'luna_hcmc'

    // 3. Locale detection
    const pathnameHasLocale = locales.some(
        (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    )

    if (!pathnameHasLocale) {
        const defaultLocale = tenantId === 'luna_hcmc' ? 'vn' : 'en'
        const url = request.nextUrl.clone()
        url.pathname = `/${defaultLocale}${pathname === '/' ? '' : pathname}`
        
        const response = NextResponse.redirect(url)
        response.headers.set('x-tenant-id', tenantId)
        return response
    }

    // 4. Pass through with tenant header
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-tenant-id', tenantId)

    const response = NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    })
    
    response.headers.set('x-tenant-id', tenantId)
    return response
}

export const config = {
    // Match all request paths except for the ones starting with:
    // - api (API routes)
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
