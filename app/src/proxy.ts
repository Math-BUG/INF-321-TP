import { NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
    const notAuthenticatedPages = ['/login', '/register'];
    
    // Skip middleware for API routes early to avoid touching DB for API calls
    if (request.nextUrl.pathname.startsWith('/api')) {
        return NextResponse.next();
    }

    // Check authentication via cookie instead of DB query
    const authCookie = request.cookies.get("auth");
    const authenticated = !!authCookie?.value;
    
    let isAdmin = false;
    if (authenticated && authCookie?.value) {
        try {
            const user = JSON.parse(authCookie.value);
            isAdmin = !!user.isAdmin || false;
        } catch (e) {
            // Cookie is malformed; treat as not authenticated
        }
    }

    // Redirect unauthenticated users away from protected pages
    if (!authenticated) {
        if (!notAuthenticatedPages.includes(request.nextUrl.pathname)) {
            return NextResponse.redirect(
                new URL('/login', request.url)
            );
        }
    } else {
        if (notAuthenticatedPages.includes(request.nextUrl.pathname)) {
            return NextResponse.redirect(
                new URL('/', request.url)
            );
        }
        
        if (!isAdmin && request.nextUrl.pathname.startsWith('/manage')) {
            console.log("Redirecting non-admin from admin page");
            return NextResponse.redirect(
                new URL('/', request.url)
            );
        }
    }

    return NextResponse.next();
}

export const config = {
  matcher: [
    // apply middleware to everything EXCEPT Next.js internal assets and public files
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
