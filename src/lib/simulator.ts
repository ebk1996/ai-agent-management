export type OperationKind = "trade" | "mine";

export function simulateOperation(kind: OperationKind) {
  return {
    operationId: `sim_${crypto.randomUUID()}`,
    kind,
    status: "simulated" as const,
    mode: "simulation-only" as const,
    executed: false,
    financialSideEffects: false,
    message: kind === "trade"
      ? "Trade scenario recorded; no order was sent to an exchange."
      : "Mining scenario recorded; no mining hardware or pool was contacted.",
    createdAt: new Date().toISOString(),
  };
}
