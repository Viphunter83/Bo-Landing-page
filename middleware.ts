import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
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
         * - images (static assets)
         * - .png, .jpg, .svg
         */
        '/((?!api|_next/static|_next/image|favicon.ico|images|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)',
    ],
}

