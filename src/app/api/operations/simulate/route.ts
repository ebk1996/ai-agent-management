import { NextResponse } from "next/server";
import { isAuthorized } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { simulateOperation } from "@/lib/simulator";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isAuthorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Expected a JSON body" }, { status: 400 }); }
  if (!body || typeof body !== "object" || !("kind" in body) || (body.kind !== "trade" && body.kind !== "mine")) {
    return NextResponse.json({ error: "kind must be 'trade' or 'mine'" }, { status: 400 });
  }
  const kind = body.kind;
  const result = simulateOperation(kind);
  audit("simulation.completed", { kind, mode: "simulation-only" });
  return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
}
