const departments = [
  { name: "Operations", roles: ["Coordinator", "Scheduler", "Workflow Monitor", "Incident Triage", "Quality Reviewer", "Process Analyst"] },
  { name: "Research", roles: ["Market Researcher", "Data Analyst", "Trend Analyst", "Source Reviewer", "Knowledge Curator", "Report Writer"] },
  { name: "Finance", roles: ["Budget Monitor", "Risk Analyst", "Ledger Reviewer", "Cost Forecaster", "Compliance Analyst", "Reconciliation Assistant"] },
  { name: "Engineering", roles: ["Build Engineer", "Test Planner", "Deployment Reviewer", "Observability Analyst", "Reliability Assistant", "Documentation Writer"] },
  { name: "Support", roles: ["Request Classifier", "Response Drafter", "Escalation Monitor", "Customer Insights", "Knowledge Assistant", "Service Reviewer"] },
  { name: "Governance", roles: ["Policy Monitor", "Access Reviewer", "Audit Curator", "Safety Evaluator", "Change Approver"] },
] as const;

export type Agent = { id: string; department: string; role: string; status: "configured"; mode: "simulation-only" };

export function getAgentRoster(): Agent[] {
  return departments.flatMap((department) => department.roles.map((role, index) => ({
    id: `${department.name.toLowerCase()}-${String(index + 1).padStart(2, "0")}`,
    department: department.name,
    role,
    status: "configured" as const,
    mode: "simulation-only" as const,
  })));
}
