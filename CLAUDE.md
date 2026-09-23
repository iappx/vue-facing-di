# CLAUDE.md — Project Rules

This file describes the **general conventions** to follow when working with the codebase: code style, naming, file layout, and how the library is built and tested.

**Project-specific knowledge** — how the component build pipeline works, how DI resolution is wired into it, and why it is shaped that way — belongs in the `.ai/` folder, not here and not in code comments. When you document a subsystem, add a doc under `.ai/`, link it from a table in this file, and keep `CLAUDE.md` itself to general conventions only.

## Project

`@iappx/vue-facing-di` — class-based Vue 3 components with constructor dependency injection resolved through a tsyringe container.

| Command | What it does |
|---|---|
| `npm run typecheck` | `tsc --noEmit` over `src/` and `test/` |
| `npm run lint` | ESLint (flat config, `eslint.config.mjs`) |
| `npm test` | Jest + jsdom + `@vue/test-utils` (`test/**/*.spec.ts`) |
| `npm run build` | tsup → `lib/` (ESM `.mjs`, CJS `.js`, `.d.ts`) |

A change is done when all four pass.

This is a published library. Everything exported from `src/index.ts` is public API: renaming or removing an export, or changing its runtime behaviour, is a breaking change and needs a major version bump.

### Project knowledge base (`.ai/`)

| Doc | Covers |
|---|---|
| [`.ai/architecture.md`](.ai/architecture.md) | How a class becomes a component: metadata, the options builders, instance construction through the container, and why injected dependencies stay non-reactive |

---

## Code Style

### Comments

Code must be readable without comments. A comment that restates what the next line does is noise — delete it and make the code say it instead (better name, extracted function, smaller class).

- **Only "why".** The single admissible reason for a comment is something the code cannot state: a subtle invariant, an ordering requirement, a workaround for a library bug, the reason a lint rule is suppressed, the consequence of doing it the obvious way. Keep it to one or two lines.
- **No inline project documentation.** Do not describe how a subsystem works in code comments — that belongs in this `CLAUDE.md` or in `.ai/`.
- **No descriptive docblocks** that restate what a class or function does (`/** Builds the component options… */`, `/** Base class for… */`). The name and signature carry that. Being exported from the package is not a reason to add one — user-facing documentation lives in `README.md`.
- **English only**, including `TODO` / `FIXME` and the justification attached to a lint suppression.

```typescript
// ❌ Wrong — describes what the code already says
// collect prop names
const names = Object.keys(props)

// ✅ Correct — explains why
// tsyringe does not expose the arguments it passes to a constructor.
this.recordConstructorArguments(dependencies)
```

### Formatting

- 4-space indentation, single quotes, no semicolons (except where ASI requires one), trailing commas in multi-line literals and argument lists.

### No standalone functions — OOP only

**`export function` is forbidden.** All logic lives inside a class as a method.

- ✅ `class MetadataRegistry { static obtain(...) {} }` — static method on a class
- ✅ `class ComponentInstantiator { instantiate(...) {} }` — instance method
- ❌ `export function obtainMetadata(...)` — bare exported function
- ❌ `export const helper = () => ...` — exported arrow function at module level

The same holds for functions that are not exported: a module-level helper is still logic outside a class — make it a `private static` method of the class that uses it.

**The one exception is decorators.** A decorator or a decorator factory is exported as a module-level constant, because that is the only form the `@` syntax accepts: `export const Prop = OptionalArgDecorator.create(...)`, `export const Watch = (source: string) => ...`. The logic behind it still belongs to a class — the constant only wires the call.

### One artifact per file

- **One class per file.** Never define two classes in the same `.ts` file.
- **One type per file.** Each type gets its own `T{Name}.ts` file under `src/types/` — except types that are tightly coupled and have no meaning in isolation, which may share a file.
- **One decorator per file**, named after the decorator: `Prop.ts`, `Watch.ts`. An alias of the same decorator (`Model` for `VModel`) lives next to it.
- **The filename matches the class, type or decorator name** exactly: class `VueBase` → `VueBase.ts`, type `TPropOption` → `TPropOption.ts`.
- **Spec files are exempt** from one-class-per-file: the component classes a test mounts are declared inside that test.

### Naming

- **Classes** — always `PascalCase`. No exceptions.
- **Types** — name starts with `T`: `TTypeName`, `TComponentOption`, `TSetupFunction`, etc.
- **Interfaces** — name starts with `I`: `IInterfaceName`, `IOptionBuilderStep`, etc.

### Types vs Interfaces

- **Do not** create an interface where a type can be used instead. Specifically, interfaces consisting only of fields (no methods) are not allowed — use `type` for that.

  ```typescript
  // ❌ Wrong — interface with fields only
  interface IPropsConfig {
      type?: any
      required?: boolean
  }

  // ✅ Correct — type for data structures
  type TPropsConfig = {
      type?: any
      required?: boolean
  }
  ```

- An **interface** must describe the **behavior** of an object that will implement it — meaning it should contain method signatures or a mixed structure with methods.

  ```typescript
  // ✅ Correct — interface describes behavior
  interface IInstanceResolver {
      resolve<T>(cons: TConstructor<T>): T
  }
  ```

  The one exception is a declaration-merging augmentation of a third-party interface (for example Vue's `ComponentCustomProperties`), which must be an `interface` by construction.
