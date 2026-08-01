import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/db/client";
import { users } from "@/src/db/schema";
import { createSession } from "@/lib/auth";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 400 }
      );
    }

    const existingUser = await db.query.users.findFirst({
      where: (users) => db.sql`${users.email} = ${email}`,
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      );
    }

    const userId = crypto.randomUUID();
    const passwordHash = crypto.createHash("sha256").update(password).digest("hex");

    await db.insert(users).values({
      id: userId,
      email,
      passwordHash,
      emailVerified: false,
      twoFactorEnabled: false,
    });

    const session = await createSession(userId);

    return NextResponse.json({
      ok: true,
      session,
      redirectUrl: "/dashboard",
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
