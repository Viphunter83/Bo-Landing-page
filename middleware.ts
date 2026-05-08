import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Only protect /admin routes
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
        '/admin/:path*',
    ],
}


