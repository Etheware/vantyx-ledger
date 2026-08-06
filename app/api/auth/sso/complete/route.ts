import { NextRequest, NextResponse } from "next/server";
import { getDatabase as db } from "@/lib/db-compat";
import { users } from "@/lib/db-compat";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

export async function GET(request: NextRequest) {
  try {
    const database = db() as any;
    const email = request.nextUrl.searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Email parameter required" },
        { status: 400 }
      );
    }

    const user = await database.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const token = randomUUID();
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
    const database = db() as any;
    const body = await request.json();
    const { email, token } = body;

    if (!email || !token) {
      return NextResponse.json(
        { error: "Email and token required" },
        { status: 400 }
      );
    }

    const user = await database.query.users.findFirst({
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
