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
    const tenantId = process.env.NEXT_PUBLIC_TENANT_ID || 'luna_hcmc'

    try {
        // --- 1. Защита админки ---
        if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
            const session = request.cookies.get('bo_session')
            if (!session) {
                // Если нет сессии Firebase (bo_session), отправляем на логин
                const loginUrl = request.nextUrl.clone()
                loginUrl.pathname = '/admin/login'
                loginUrl.searchParams.set('redirect', pathname)
                return NextResponse.redirect(loginUrl)
            }
        }

        // --- 2. Роутинг локалей (i18n) ---
        // Проверяем, есть ли уже локаль в пути
        const pathnameHasLocale = locales.some(
            (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
        )

        // Если локали нет и это не админка, редиректим на путь с дефолтной локалью
        // Замечание: для корня ('/') Next.js сам может отдавать app/page.tsx,
        // но если мы хотим строгий редирект (например, с '/' на '/vn'):
        if (!pathnameHasLocale && !pathname.startsWith('/admin')) {
            const defaultLocale = getDefaultLocale(tenantId)
            
            // Если вы предпочитаете rewrite (сохраняет красивый URL), а не redirect:
            // const newUrl = request.nextUrl.clone()
            // newUrl.pathname = `/${defaultLocale}${pathname === '/' ? '' : pathname}`
            // return NextResponse.rewrite(newUrl)
            
            // Но redirect безопаснее для SEO и исключения 500 ошибок (если страница не существует):
            const redirectUrl = request.nextUrl.clone()
            redirectUrl.pathname = `/${defaultLocale}${pathname === '/' ? '' : pathname}`
            return NextResponse.redirect(redirectUrl)
        }

        // Если все проверки пройдены, продолжаем
        return NextResponse.next()

    } catch (error) {
        // Defensive check: если что-то упало, пишем в логи Vercel и пропускаем запрос, чтобы не было 500
        console.error('[Middleware Error]:', {
            error: error instanceof Error ? error.message : String(error),
            path: pathname,
            tenant: tenantId
        })
        return NextResponse.next()
    }
}

export const config = {
    // Оптимизированный matcher: пропускаем api, статику, картинки, системные файлы Next.js и Vercel
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|images|manifest\\.webmanifest|sitemap\\.xml|robots\\.txt|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$|.*\\.webp$|.*\\.ico$|.*\\.woff$|.*\\.woff2$|.*\\.mp4$).*)',
    ],
}
