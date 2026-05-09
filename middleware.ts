import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Поддерживаемые локали для универсального шаблона (включая Вьетнам и Дубай)
const locales = ['en', 'ru', 'ar', 'vn']

// Получаем дефолтную локаль на основе текущего тенанта
function getDefaultLocale(tenantId: string) {
    return tenantId === 'luna_hcmc' ? 'vn' : 'en'
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl
    
    // Detect Tenant ID (Priority: Header > Env)
    let tenantId = request.headers.get('x-tenant-id') || process.env.NEXT_PUBLIC_TENANT_ID || 'luna_hcmc'

    // Create custom request headers
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-tenant-id', tenantId)

    try {
        // --- 1. Защита админки ---
        if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
            const session = request.cookies.get('bo_session')
            if (!session) {
                const loginUrl = request.nextUrl.clone()
                loginUrl.pathname = '/admin/login'
                loginUrl.searchParams.set('redirect', pathname)
                const response = NextResponse.redirect(loginUrl)
                response.headers.set('x-tenant-id', tenantId)
                return response
            }
        }

        // --- 2. Роутинг локалей (i18n) ---
        const pathnameHasLocale = locales.some(
            (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
        )

        if (!pathnameHasLocale && !pathname.startsWith('/admin')) {
            const defaultLocale = getDefaultLocale(tenantId)
            const redirectUrl = request.nextUrl.clone()
            redirectUrl.pathname = `/${defaultLocale}${pathname === '/' ? '' : pathname}`
            const response = NextResponse.redirect(redirectUrl)
            response.headers.set('x-tenant-id', tenantId)
            return response
        }

        // --- 3. Pass through with headers ---
        const response = NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        })
        response.headers.set('x-tenant-id', tenantId)
        return response

    } catch (error) {
        console.error('[Middleware Error]:', {
            error: error instanceof Error ? error.message : String(error),
            path: pathname,
            tenant: tenantId
        })
        return NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        })
    }
}

export const config = {
    // Оптимизированный matcher: пропускаем api, статику, картинки, системные файлы Next.js и Vercel
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|images|manifest\\.webmanifest|sitemap\\.xml|robots\\.txt|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$|.*\\.webp$|.*\\.ico$|.*\\.woff$|.*\\.woff2$|.*\\.mp4$).*)',
    ],
}
