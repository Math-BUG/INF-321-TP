import { NextRequest, NextResponse } from "next/server";
import prisma from "./lib/prisma";

export async function proxy(request: NextRequest) {
    const notAuthenticatedPages = ['/login', '/register'];

    const users = await prisma.user.findMany();

    const authenticated = false;
    const typeUser: string = "admin";

    if (request.nextUrl.pathname.startsWith('/api')) {
        return NextResponse.next();
    }
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
