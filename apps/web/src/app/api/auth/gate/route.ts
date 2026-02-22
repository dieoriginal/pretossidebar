import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { password } = await request.json();
        const sitePassword = process.env.SITE_PASSWORD;
        const siteSecret = process.env.SITE_SECRET || "default-secret-change-me";

        if (!sitePassword) {
            return NextResponse.json({ error: "No password configured" }, { status: 500 });
        }

        if (password !== sitePassword) {
            return NextResponse.json({ error: "Senha incorreta" }, { status: 401 });
        }

        // Generate hash for the cookie value
        const encoder = new TextEncoder();
        const data = encoder.encode(sitePassword + siteSecret);
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

        // Set cookie that expires in 30 days
        const response = NextResponse.json({ success: true });
        response.cookies.set("site-access", hash, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 30, // 30 days
            path: "/",
        });

        return response;
    } catch {
        return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
}
