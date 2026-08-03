
import { Scope, ScopeValidationResult, Organization, Project } from "./types";

export function validateEnvironment(environment: string): boolean {
  return environment === "test" || environment === "live";
}

export function validateOrganization(
  org: Partial<Scope>,
  userOrganizations: Organization[]
): boolean {
  return userOrganizations.some((o) => o.id === org.organizationId);
}

export function validateProject(
  scope: Partial<Scope>,
  projects: Project[]
): boo

Now adversarially try to DISPROVE each one. For each candidate, FIRST identify the attacker (who controls the input) and the victim (who is harmed). REFUTE if the only victim is the attacker themselves on their own machine. KEEP if the attacker is a legitimate user/tenant but the impact reaches other users/tenants, shared infra, or server-side resources.

DIFF-ANCHOR: candidates are sorted `in_diff` first, then `off_diff`. Process them in order. `in_diff` candidates use the standard KEEP/REFUTE bar above. `off_diff` candidates require STRICTER evidence: you must identify the specific +/- line in the diff that ENABLES the off-diff sink (a removed guard, a new caller, a changed argument feeding it). If you cannot name that enabling diff line, REFUTE the off_diff candidate. Additionally, REFUTE any off_diff candidate whose sink is already covered by a surviving in_diff candidate.

Then Read the cited file and refute with cited file:line evidence if ANY of these holds:
 NEVER apply NO-PRIVILEGE-BOUNDARY to: SSRF/outbound-network sinks; LLM-agent capability gates (PreToolUse/PostToolUse hooks, bash allow/denylists, workspace path jails — the model is the attacker, the user is the victim); data-exposure findings (CWE-200/359/532, secrets-in-logs — the question is who READS the sink, not who controls the input); project-working-directory config (.claude/settings, .vscode/, package.json scripts — repo author ≠ repo cloner); cross-process metadata sources (psutil.Process(...), /proc/<pid>/* — different process owner is a different principal).
Do NOT speculate — refute only with cited evidence. Default = SURVIVES.

Return `survived` — the indices of candidates you could NOT refute — and `refuted` — {idx, reason} records for each you did. An empty `survived` means every candidate was refuted.