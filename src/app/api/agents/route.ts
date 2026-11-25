import { NextResponse } from "next/server";
import { getAgentRoster } from "@/lib/agents";

export function GET() {
  return NextResponse.json({ mode: "simulation-only", agents: getAgentRoster() }, { headers: { "Cache-Control": "no-store" } });
}
