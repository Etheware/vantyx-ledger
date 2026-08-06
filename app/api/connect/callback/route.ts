import { NextRequest, NextResponse } from "next/server";
import { createConnectService } from "@/lib/vantyx/connect-service";

export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get("code");
    const state = request.nextUrl.searchParams.get("state");
    const error = request.nextUrl.searchParams.get("error");

    if (error) {
      const errorDescription = request.nextUrl.searchParams.get("error_description");
      return NextResponse.json(
        { error: errorDescription || error },
        { status: 400 }
      );
    }

    if (!code || !state) {
      return NextResponse.json(
        { error: "Missing code or state" },
        { status: 400 }
      );
    }

    const connectService = createConnectService();
    const connectAccount = await connectService.getConnectAccount(state);

    if (!connectAccount) {
      return NextResponse.json(
        { error: "Connect account not found" },
        { status: 404 }
      );
    }

    const tokenResponse = await fetch("https://connect.stripe.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_secret: process.env.STRIPE_SECRET_KEY || "",
        code,
        grant_type: "authorization_code",
      }).toString(),
    });

    const tokenData = (await tokenResponse.json()) as any;

    if (tokenData.error) {
      return NextResponse.json(
        { error: tokenData.error_description || tokenData.error },
        { status: 400 }
      );
    }

    const stripeConnectId = tokenData.stripe_user_id;

    await connectService.updateConnectStatus(
      connectAccount.tenantId,
      stripeConnectId,
      "active"
    );

    const redirectUrl = new URL("/dashboard/connect", request.nextUrl.origin);
    redirectUrl.searchParams.set("success", "true");
    return NextResponse.redirect(redirectUrl.toString());
  } catch (error) {
    const message = error instanceof Error ? error.message : "Callback failed";
    const errorUrl = new URL("/dashboard/connect", request.nextUrl.origin);
    errorUrl.searchParams.set("error", message);
    return NextResponse.redirect(errorUrl.toString());
  }
}
