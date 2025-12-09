import { NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
    const notAuthenticatedPages = ['/login', '/register'];
    
    if (request.nextUrl.pathname.startsWith('/api')) {
        return NextResponse.next();
    }

    const authCookie = request.cookies.get("auth");
    const authenticated = !!authCookie?.value;
    
    let isAdmin = false;
    if (authenticated && authCookie?.value) {
        try {
            const user = JSON.parse(authCookie.value);
            isAdmin = !!user.isAdmin || false;
        } catch (e) {
        }
    }

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
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
