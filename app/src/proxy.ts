import { NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
    const notAuthenticatedPages = ['/login', '/register'];

    const authenticated = false;
    const typeUser = "admin";

    if (
        !authenticated
    ) {
        if (!notAuthenticatedPages.includes(request.nextUrl.pathname)) {
            return NextResponse.redirect(
                new URL('/login', request.url)
            );
        }
    } else {
        if (notAuthenticatedPages.includes(request.nextUrl.pathname)) {
            return  NextResponse.redirect(
                new URL('/', request.url)
            );
        }
        if (typeUser === "default") {
            if (request.nextUrl.pathname.startsWith('/manage')) {
                return NextResponse.redirect(
                    new URL('/', request.url)
                );
            }
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
