import { createAdminClient } from "@/lib/appwrite";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request:NextRequest) {
    const userId = request.nextUrl.searchParams.get('userId');
    const secret = request.nextUrl.searchParams.get('secret');
      if (!userId || !secret) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/signup?error=missing_params`
    );
  }
  try {
    const {account} = await createAdminClient();
    const session = await account.createSession(userId, secret);

    const cookieStore = await cookies();
    cookieStore.set("session", session.secret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`);
  } catch (error) {
    console.error("OAuth callback error:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/signup?error=auth_failed`
    );
  }

}