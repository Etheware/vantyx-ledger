import { NextRequest, NextResponse } from "next/server";
import { Configuration, PlaidApi, PlaidEnvironments, CountryCode } from "plaid";

const configuration = new Configuration({
  basePath: PlaidEnvironments.Sandbox,
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID,
      "PLAID-SECRET": process.env.PLAID_SECRET,
    },
  },
});

const client = new PlaidApi(configuration);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID required" },
        { status: 400 }
      );
    }

    const response = await client.linkTokenCreate({
      user: { client_user_id: userId },
      client_name: "Vantyx Ledger",
      language: "en",
      country_codes: [CountryCode.Us],
      products: ["auth"],
    });

    return NextResponse.json({
      ok: true,
      linkToken: response.data.link_token,
    });
  } catch (error) {
    console.error("Plaid link token error:", error);
    return NextResponse.json(
      { error: "Failed to create link token" },
      { status: 500 }
    );
  }
}
