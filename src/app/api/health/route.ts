import { NextResponse } from "next/server";
import { getAgentRoster } from "@/lib/agents";

export const runtime = "nodejs";

export function GET() {
  return NextResponse.json({
    status: "ok",
    mode: "simulation-only",
    liveFinancialOperations: false,
    agentCount: getAgentRoster().length,
    timestamp: new Date().toISOString(),
  }, { headers: { "Cache-Control": "no-store" } });
}
