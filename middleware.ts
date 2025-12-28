import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { SUPER_ADMIN_EMAIL } from './app/lib/access'

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname

    // 1. Only protect /admin routes
    if (!path.startsWith('/admin')) {
        return NextResponse.next()
    }

    // 2. Check for session cookie (set by Firebase Auth on client usually, or we use a custom one)
    // Since we are using client-side Firebase Auth, the server doesn't automatically know the user unless we sync cookies.
    // HOWEVER, for a simple protection in this stack without a dedicated Auth Server, 
    // we often rely on Client-Side HOC (Higher Order Component) or a simple cookie check if available.

    // BUT: The user asked for "Middleware protection".
    // To do this strictly on the server with Firebase client-side only is tricky.
    // We need to set a cookie when the user logs in.

    // FOR NOW: We will implement a "Login Gate" check.
    // If no 'bo_session' cookie exists, redirect to login.
    // The client-side login page will be responsible for setting this cookie.

    const session = request.cookies.get('bo_session')

    if (!session && path !== '/admin/login') {
        // Redirect to login page
        const url = request.nextUrl.clone()
        url.pathname = '/admin/login'
        url.searchParams.set('redirect', path)
        return NextResponse.redirect(url)
    }

    // If session exists, we let them through. 
    // Fine-grained role checks happen on the page or via a second verification if needed.
    // 3. Root redirect for i18n
    if (path === '/') {
        const url = request.nextUrl.clone()
        url.pathname = '/en'
        return NextResponse.redirect(url)
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/admin/:path*',
        '/' // Match root to enable redirect
    ],
}
