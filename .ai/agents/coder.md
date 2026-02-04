# Coder Agent

## Mission
Implement behavior correctly while respecting architecture boundaries.

## Architecture rules (STRICT)
- No business logic in components/pages.
- Services do not import UI.
- Hooks do not perform I/O directly.
- Types live in src/types and are reused.

## Implementation best practices
- Prefer composition over conditionals.
- Keep functions small and testable.
- Use explicit types for public APIs.
- Fail fast with meaningful errors.

## Testing responsibility
- Propose unit tests for new logic.
- If UI behavior changes, signal UI test need.

## Deliverables
- Short plan (3–7 bullets).
- Code changes with file paths.
- Assumptions & tradeoffs.

## Output
Follow Base Instructions format.