import { NextRequest, NextResponse } from "next/server";
import { getDatabase as db } from "vantyx-db";
import { users } from "vantyx-db";
import { eq } from "drizzle-orm";
import crypto from "crypto";

export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Email parameter required" },
        { status: 400 }
      );
    }

    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const token = crypto.randomBytes(32).toString("hex");
    const response = NextResponse.redirect(new URL("/dashboard", request.url), {
      status: 303,
    });
    response.cookies.set("verification", token, {
      httpOnly: true,
      maxAge: 3600,
    });

    return response;
  } catch (error) {
    console.error("SSO complete error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, token } = body;

    if (!email || !token) {
      return NextResponse.json(
        { error: "Email and token required" },
        { status: 400 }
      );
    }

    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      userId: user.id,
      email: user.email,
      redirectUrl: "/dashboard",
    });
  } catch (error) {
    console.error("SSO complete POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}