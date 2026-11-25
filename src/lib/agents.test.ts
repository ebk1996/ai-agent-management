import { describe, expect, it } from "vitest";
import { getAgentRoster } from "./agents";
import { simulateOperation } from "./simulator";

describe("agent roster", () => {
  it("contains 35 configured agents across six departments", () => {
    const agents = getAgentRoster();
    expect(agents).toHaveLength(35);
    expect(new Set(agents.map((agent) => agent.department)).size).toBe(6);
    expect(agents.every((agent) => agent.mode === "simulation-only")).toBe(true);
  });
});

describe("financial operation simulator", () => {
  it.each(["trade", "mine"] as const)("never executes a %s operation", (kind) => {
    const result = simulateOperation(kind);
    expect(result.executed).toBe(false);
    expect(result.financialSideEffects).toBe(false);
    expect(result.mode).toBe("simulation-only");
  });
});
