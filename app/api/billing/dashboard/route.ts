import { NextRequest, NextResponse } from "next/server";
import { getDatabase, subscriptions, invoices } from "@/lib/db-compat";
import { eq, and, gte, lte } from "drizzle-orm";
import { readVerifiedEmailToken, EMAIL_VERIFIED_COOKIE } from "@/lib/auth/email-code";

export async function GET(request: NextRequest) {
  const verifiedCookie = request.cookies.get(EMAIL_VERIFIED_COOKIE)?.value;
  if (!verifiedCookie) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const verified = readVerifiedEmailToken(verifiedCookie);
  if (!verified) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDatabase() as any;
  if (!db) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  try {
    // Get tenant ID from query param (stub—in production would verify access)
    const tenantId = request.nextUrl.searchParams.get("tenantId") || "";
    if (!tenantId) {
      return NextResponse.json({ error: "Missing tenantId parameter" }, { status: 400 });
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Active subscriptions count
    const activeSubsCount = await db.query.subscriptions.findMany({
      where: and(eq(subscriptions.tenantId, tenantId), eq(subscriptions.status, "active")),
    });

    // MRR (Monthly Recurring Revenue)
    const mrrCents = activeSubsCount.reduce((sum: number, sub: any) => sum + sub.amountCents, 0);

    // Recent invoices
    const recentInvoices = await db.query.invoices.findMany({
      where: and(
        eq(invoices.tenantId, tenantId),
        gte(invoices.createdAt, thirtyDaysAgo),
        lte(invoices.createdAt, now)
      ),
      limit: 10,
    });

    // Total revenue in last 30 days (from paid invoices)
    const paidInvoices = recentInvoices.filter((inv: any) => inv.status === "paid");
    const totalRevenueCents = paidInvoices.reduce((sum: number, inv: any) => sum + inv.totalCents, 0);

    // Churn rate stub (would need historical data)
    const cancelledSubsCount = await db.query.subscriptions.findMany({
      where: and(eq(subscriptions.tenantId, tenantId), eq(subscriptions.status, "cancelled")),
    });

    const churnRatePercent = activeSubsCount.length > 0
      ? Math.round((cancelledSubsCount.length / (activeSubsCount.length + cancelledSubsCount.length)) * 100)
      : 0;

    return NextResponse.json({
      metrics: {
        mrr: mrrCents,
        mrrUsd: (mrrCents / 100).toFixed(2),
        activeSubscriptions: activeSubsCount.length,
        revenue30Days: totalRevenueCents,
        revenue30DaysUsd: (totalRevenueCents / 100).toFixed(2),
        churnRate: churnRatePercent,
        totalInvoices: recentInvoices.length,
      },
      recentInvoices: recentInvoices.map((inv: any) => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        amount: (inv.totalCents / 100).toFixed(2),
        status: inv.status,
        issuedAt: inv.createdAt,
        dueAt: inv.dueAt,
      })),
      period: {
        from: thirtyDaysAgo.toISOString(),
        to: now.toISOString(),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Dashboard query failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
