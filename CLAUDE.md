# CLAUDE.md — Visual Context Node Builder for AI

## Project Overview

A VS Code extension providing an interactive infinite-canvas node graph where developers
visually map, prune, and bundle their codebase as structured context for AI coding assistants.

**Core values:** Privacy by Design · Anti-Cliché AI UI · Tactile & Responsive

See `SPEC.md` for full functional specification.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Extension host | TypeScript, VS Code Extension API |
| Webview UI | React + React Flow (node canvas) |
| UI Design/Prototyping | Pencil (via MCP — always design in Pencil first) |
| State management | Zustand |
| Bundler/AST | Custom TypeScript AST scanner |
| Build | esbuild or Webpack (standard VS Code extension setup) |

---

## Agent Team — Default Workflow

**Always use the agent team for non-trivial tasks.** Start with the Orchestrator.

| Agent | File | Responsibility |
|---|---|---|
| Orchestrator | `.claude/agents/orchestrator.md` | Breaks down tasks, delegates, integrates |
| VS Code Extension | `.claude/agents/vscode-extension.md` | Extension API, commands, webview messaging |
| React Canvas | `.claude/agents/react-canvas.md` | React Flow canvas, nodes, edges, UI components |
| AST & Bundler | `.claude/agents/ast-bundler.md` | Import scanning, dependency resolution, export formats |
| UI Designer | `.claude/agents/ui-designer.md` | Pencil design, component aesthetics, design system |

**Usage pattern:**
1. Describe the task to the Orchestrator agent first
2. Orchestrator produces a subtask breakdown + assigns agents
3. Specialist agents execute in parallel where possible
4. Orchestrator reviews and integrates the result

---

## Coding Standards

### File size
- **Hard limit: 200 lines per file.** Split by responsibility when approaching this.
- Prefer many small, focused modules over large monoliths.

### TypeScript
- Strict mode always (`"strict": true` in tsconfig).
- No `any` — use `unknown` + type guards when needed.
- Explicit return types on all exported functions.
- Prefer `type` over `interface` unless declaration merging is needed.

### React
- Functional components only. No class components.
- Custom hooks live in `src/webview/hooks/` — one hook per file.
- Components live in `src/webview/components/` — one component per file.
- Use extracted style-object constants (`React.CSSProperties`) at file scope. No literal inline styles in JSX.
- Shared colors, fonts, and spacing are defined in `src/webview/theme/tokens.ts`.

### Reusability
- Extract any logic used more than once into a shared utility.
- Utilities live in `src/shared/` (accessible to both extension host and webview).
- Keep extension-host-only code in `src/extension/` and webview-only in `src/webview/`.

### Naming
- Files: `kebab-case.ts`
- React components: `PascalCase.tsx`
- Hooks: `useHookName.ts`
- Types: `PascalCase` (e.g. `ContextNode`, `BundleOutput`)

### No over-engineering
- Don't add abstraction layers for hypothetical future needs.
- Three similar lines of code beats a premature abstraction.
- No feature flags unless explicitly requested.

---

## Design Principles (Anti-Cliché AI UI)

The UI must feel like a **professional engineering tool** — not a consumer AI product.

- **Avoid:** sparkle icons, chat bubbles, purple/neon gradients, generic robot imagery
- **Aim for:** electrical blueprint aesthetic, Blender/Nuke node editor feel, clean drafting table
- **Palette:** muted, professional — dark grays, off-whites, single accent color (not purple)
- **Motion:** instant, tactile — no "AI thinking" spinners. Operations complete or fail fast.
- **Typography:** monospace for code previews, clean sans-serif for UI text

Always **design in Pencil first** before implementing React components.
Use the `ui-designer` agent for all visual design decisions.

---

## MCP Tools Available

### Pencil
Used for UI design and visual prototyping. Always design screens in Pencil before
implementing them in React. The `ui-designer` agent owns this tool.

```
Design flow: Pencil mockup → review → React implementation
```

### Claude in Chrome
Used for browser-based testing and validation of the webview UI when running
in a browser dev environment.

---

## Documentation Maintenance

- **SPEC.md** — Product spec. Update when scope changes. Never let implementation drift from spec silently; either update spec or raise the discrepancy.
- **CLAUDE.md** (this file) — Keep current. Update when new agents, tools, or conventions are added.
- **`.claude/agents/*.md`** — Agent definitions. Update when agent responsibilities change.
- Add JSDoc to all exported functions and types.
- Document "why" in comments, not "what" (the code shows what).

---

## Agent Attribution

After completing any non-trivial task, add a footer comment to the PR/commit description:

```
Agents involved: Orchestrator, [specialist agents used]
```

For in-file attribution on significant additions, use a single-line comment:

```typescript
// Implemented by: react-canvas agent
```

---

## Project Structure (Target)

```
visual-context-node-builder-for-ai/
├── CLAUDE.md                    # This file
├── SPEC.md                      # Product specification
├── .mcp.json                    # MCP server configuration
├── .claude/
│   ├── agents/                  # Agent definitions (auto-discovered by Claude Code)
│   │   ├── orchestrator.md
│   │   ├── vscode-extension.md
│   │   ├── react-canvas.md
│   │   ├── ast-bundler.md
│   │   └── ui-designer.md
│   └── commands/                # Custom slash commands
│       ├── new-feature.md
│       ├── design-component.md
│       └── spec-check.md
├── src/
│   ├── extension/               # VS Code extension host
│   │   ├── extension.ts         # Activation entry point
│   │   ├── commands/            # Command handlers
│   │   ├── providers/           # Webview providers
│   │   └── services/            # Extension services
│   ├── webview/                 # React webview app
│   │   ├── App.tsx
│   │   ├── components/          # React components
│   │   ├── hooks/               # Custom React hooks
│   │   ├── store/               # Zustand stores
│   │   └── utils/               # Webview utilities
│   └── shared/                  # Shared types and utilities
│       ├── types/               # Shared TypeScript types
│       └── utils/               # Shared pure utilities
├── designs/                     # Pencil design files (.pen)
└── package.json
```

---

## Key Constraints & Gotchas

- The webview runs in a sandboxed iframe — no direct Node.js access. All FS operations go through the extension host via `postMessage`.
- Webview state is lost on tab hide unless `retainContextWhenHidden: true` is set (beware memory cost).
- React Flow handles its own internal state — sync carefully with Zustand, avoid double-source-of-truth.
- AST parsing (import scanning) must be resilient — handle aliased imports, barrel files, dynamic imports gracefully (skip with a warning, don't crash).
- Context bundles can get large — always include a token estimate in the export UI.
