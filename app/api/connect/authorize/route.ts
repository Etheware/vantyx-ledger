import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth/session";
import { createConnectService } from "@/lib/vantyx/connect-service";

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("vantyx_session")?.value;
    if (!sessionCookie) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const session = await verifySessionToken(sessionCookie);
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const connectService = createConnectService();
    const existing = await connectService.getConnectAccount(session.orgUuid);

    if (existing && existing.status === "active") {
      return NextResponse.json(
        { error: "Connect account already linked" },
        { status: 400 }
      );
    }

    const account = await connectService.createConnectAccount(
      session.orgUuid,
      session.userEmail
    );

    const stripeConnectUrl = new URL("https://connect.stripe.com/oauth/authorize");
    stripeConnectUrl.searchParams.set("client_id", process.env.STRIPE_CONNECT_CLIENT_ID || "");
    stripeConnectUrl.searchParams.set("state", account.id);
    stripeConnectUrl.searchParams.set("stripe_landing", "login");
    stripeConnectUrl.searchParams.set("type", "standard");
    stripeConnectUrl.searchParams.set("scope", "read_write");

    return NextResponse.json({
      authorizationUrl: stripeConnectUrl.toString(),
      connectAccountId: account.id,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Authorization failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
