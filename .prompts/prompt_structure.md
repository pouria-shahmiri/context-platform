# AI Task Context

This file defines the REQUIRED workflow and output structure for any AI task in this repository.
Follow existing rules and roles defined in .ai/instructions/* and .ai/agents/*.

---

## 🟦 AI TASK REQUEST (WRITE BELOW)
<!--
WRITE YOUR REQUEST HERE.

Be explicit about WHAT you want, not HOW to implement it.
Examples:
- Fix bug where submitting form X crashes page Y
- Add validation for input Z
- Refactor service A without changing behavior
- Add UI test for flow B
-->
<YOUR REQUEST HERE>

---

## REQUIRED WORKFLOW (DO NOT SKIP)
1. Restate the request as acceptance criteria (Given / When / Then).
2. Identify affected areas (UI, service, hook, type).
3. Check architecture constraints.
4. Decide required tests:
   - Unit / functionality test
   - UI test
   - Both
5. Implement the smallest correct change.
6. Verify with tests or explicitly state why tests are blocked.

---

## REQUIRED CHECKS (BEFORE FINALIZING)
- No business logic in UI components.
- Side effects only in services.
- No secrets added or logged.
- At least one relevant test exists.
- Tests validate behavior, not implementation.

---

## FINAL OUTPUT FORMAT (MANDATORY)
### Summary
What changed and why.

### Acceptance Criteria
- Given / When / Then bullets.

### Changes
- `path/to/file` — reason.

### Tests
- Command(s) run.
- PASS / FAIL.
- Short result summary.
- If blocked: why.

### Risks / Notes
Assumptions, follow-ups, limitations.