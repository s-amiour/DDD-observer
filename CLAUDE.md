# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install       # install dependencies
npm run dev       # run index.ts via tsx (entry point)
```

No test runner or linter is configured. TypeScript type-checking is enforced by the compiler (`tsc --noEmit`) but not wired to a script.

## Agent Rules (from docs/spec.md)

- **AI agents must NOT write code.** Agents may only write documentation and markdown files.
- **Always prompt the user before writing or committing any file.**

## Architecture

This is a TypeScript DDD (Domain-Driven Design) exercise project. All runnable code lives in `index.ts` at the root. The project is ESM (`"type": "module"`) and uses `tsx` for direct TypeScript execution without a build step.

### DDD Patterns in Use

| Pattern                | Purpose                                                                                              |
| ---------------------- | ---------------------------------------------------------------------------------------------------- |
| **Branded Types**      | Prevent mixing primitives of the same underlying type (e.g. `Email` vs `PhoneNumber`)                |
| **Smart Constructors** | Validate business rules at creation time; invalid values never exist in the domain                   |
| **Value Objects**      | Immutable domain concepts defined by their value (e.g. `Money`, `Email`, `OperatingHours`)           |
| **Entities**           | Domain objects with identity and lifecycle that enforce their own invariants (e.g. `Table`, `Order`) |
| **Observer Pattern**   | Event-driven communication between domain objects, added at the end of the exercise                  |

The guiding principle is **"parse, don't validate"**: raw input is transformed into strongly-typed domain objects at the system boundary; inside the domain, types are trusted.

### Key Design Constraints

- No primitive obsession: raw `number`, `string`, etc. must be wrapped in branded/domain types before use.
- Domain logic (e.g. "am I open at 2 AM?") belongs inside domain objects, not in utility functions.
- Factory functions (FP style) vs. class constructors (OOP style) are explicitly distinguished.

## Custom Skills

- `/review` — reviews code for DDD compliance against `docs/rationale.md` and `docs/spec.md`
- `/explain` — writes a markdown summary of the exercise or function to be explained
