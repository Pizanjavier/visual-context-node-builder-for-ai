# Product Specification: Visual Context Node Builder for AI (VS Code Extension)

## 1. Overview
Current AI coding assistants rely on opaque, text-based context gathering. Developers lack control over what exact code snippets, files, or dependencies are sent to the LLM, leading to token waste, hallucinated fixes, and privacy concerns. 

This project is a VS Code extension that introduces a **Visual Context Builder**. It provides an interactive "infinite canvas" within a VS Code Webview where developers can visually map, prune, and bundle their codebase architecture as a node graph before feeding it to an AI.

## 2. Design Philosophy
* **Privacy by Design:** The user must explicitly see and approve every line of code that gets bundled. 
* **Anti-Cliché AI UI:** The interface will explicitly avoid standard AI tropes (no sparkling wand icons, no generic chat bubbles, no purple/neon gradients). It will feel like a professional, tactile engineering tool—more akin to an electrical blueprint, a node-based compositor (like Blender or Nuke), or a clean architectural drafting table.
* **Tactile & Responsive:** Dragging, dropping, and connecting nodes must feel instantaneous and fluid.

## 3. Technology Stack
* **Core Extension:** TypeScript / VS Code Extension API.
* **UI Framework:** React (rendered inside a VS Code Webview).
* **Graph Rendering:** React Flow (or similar node-based visual library) for the infinite canvas.
* **UI Generation / Prototyping:** **Pencil** (Pencil.dev) to iteratively design and generate the non-standard React UI components directly on a canvas, translating visual intent into production-ready React code.
* **State Management:** Zustand or React Context (lightweight, predictable state across the webview).
* **Bundler Logic:** Custom AST (Abstract Syntax Tree) parsing or Regex-based import scanning to resolve local file dependencies.

## 4. Functional Specifications

### 4.1. Extension Activation & Canvas Initialization
* **Trigger:** The user can open the Visual Context Builder via the VS Code Command Palette, a sidebar icon, or by right-clicking a file/folder and selecting "Add to Visual Context".
* **The Canvas:** A dedicated VS Code editor tab opens, displaying a blank, infinite grid webview. 

### 4.2. Building the Context Graph (The "What")
* **Drag and Drop:** Users can drag files directly from the VS Code file explorer onto the canvas. 
* **Node Representation:** Dropping a file creates a visual "Node". Each node displays the file name, its relative path, and a quick summary of its contents (e.g., exported functions/classes).
* **Dependency Expansion:** A node will feature an "Expand Dependencies" button. Clicking this will automatically parse the file's imports/exports, spawning connected nodes for all related files in the project.
* **Manual Connections:** Users can manually draw lines between nodes to indicate logical relationships that might not be explicit in the import statements (e.g., connecting a database schema file to a frontend UI component).

### 4.3. Context Curation & Pruning
* **Node Deletion:** Users can select any node (or group of nodes) and press 'Delete' to remove them from the context graph. This does *not* delete the file from the hard drive, only from the AI's context window.
* **Precision Selection:** Clicking into a node allows the user to uncheck specific functions or classes within that file, excluding them from the final bundle to save tokens.
* **Redaction (Privacy Mode):** Users can highlight specific code blocks or nodes and mark them as "Redacted". The system will replace this content with a `[REDACTED FOR PRIVACY]` placeholder in the final output.

### 4.4. Git-Aware Context Seeding

The most powerful way to build context is to start from what actually changed. Instead of manually dragging files, the **Seed from Git** feature analyzes git diffs at the symbol level and automatically constructs a dependency-aware context graph.

#### Why This Matters

A raw `git diff` shows line-level text changes with ~3 lines of surrounding context. That's enough for a human reviewer, but it's poor context for an AI coding assistant:

- The AI doesn't know *which functions or types* were modified — only that lines changed.
- The AI has no idea which other files *consume* the changed code — it can't assess blast radius.
- The AI receives no full file content — just disconnected hunks.

Git-Aware Seeding solves all three problems. It turns a diff into a structured, symbol-level context graph with impact analysis.

#### How It Works

1. **Choose a diff source.** The toolbar dropdown offers three options:
   - **Staged changes** — files in the git index (`git diff --cached`)
   - **Unstaged changes** — working tree modifications (`git diff`)
   - **Pick Commit** — compare any commit against HEAD (shows a recent-commit picker)

2. **Diff parsing & symbol extraction.** The extension parses the raw diff output, maps changed line ranges to AST-extracted symbols (functions, classes, types, interfaces, variables, enums), and determines which specific symbols were added, modified, or deleted.

3. **Reverse dependency scanning.** A workspace-wide import index is built (and cached) to find every file that imports or references the changed symbols. This produces an impact map: *"symbol X from file A is used by files B, C, and D at specific lines."*

4. **Canvas population.** Changed files appear as nodes on the canvas with visual status indicators:
   - Green left border → added file
   - Amber left border → modified file
   - Red left border → deleted file (shown at reduced opacity)
   - Orange dots next to individual changed symbols within a node

5. **Dependents panel.** Reverse dependencies are shown in a sidebar panel, grouped by directory. The developer can selectively add consuming files to the canvas, with `gitDependency` edges automatically drawn to the source nodes.

6. **Context export.** When generating context, a **Git Diff Summary** section is prepended to the output containing:
   - The diff source description
   - A per-file list of changed symbols (or "(no symbols — non-code file)" for non-TS/JS files)
   - An **Impact Analysis** showing which symbols are consumed by which files, with line numbers

#### Use Cases

| Scenario | Without Git Seed | With Git Seed |
|---|---|---|
| **Code review prep** — "I changed the auth middleware, what should the AI check?" | Manually find and drag every file that imports from the middleware. Hope you don't miss one. | One click: Seed from Staged. All changed files + all consumers appear automatically. |
| **Bug fix context** — "This function broke, help me fix it and update callers." | Copy-paste the diff into the chat. The AI sees line hunks but has no idea who calls the function. | Seed from the commit. The AI sees the full function, knows it's consumed by 4 files, and can update all call sites. |
| **Refactoring impact** — "I'm renaming a type across the codebase." | Drag every file individually. Miss files in subdirectories you forgot about. | Seed from Unstaged. The reverse dependency scanner finds every consumer, including ones in directories you'd never think to check. |
| **PR description** — "Summarize what this change does and what it affects." | Write the summary yourself from memory. | Generate Context from the seeded canvas. The output includes a structured summary with symbol-level changes and impact analysis — paste it straight into the PR. |

#### Comparison: Raw Diff vs. Git Seed Context

**Raw diff output:**
```
diff --git a/src/auth/middleware.ts b/src/auth/middleware.ts
@@ -12,6 +12,8 @@ export function validateSession(token: string) {
+  if (isExpired(token)) {
+    throw new SessionExpiredError();
   }
```

**Git Seed context output:**
```
## Git Diff Summary
Source: Staged changes

### Changed Symbols
- `src/auth/middleware.ts` (modified): validateSession

### Impact Analysis
- `validateSession` (from `src/auth/middleware.ts`) is used by:
  - src/routes/api.ts:45
  - src/routes/webhook.ts:12
  - src/services/user-service.ts:78

### src/auth/middleware.ts

[full file content with validateSession highlighted as changed]
```

The AI receives the complete function, knows exactly what changed at the symbol level, and sees every file that will be affected — without the developer lifting a finger.

#### Progress & Feedback

- A slim progress bar appears during scanning (diff parsing → symbol extraction → import index → reverse deps).
- After completion, an info banner summarizes: *"Seeded from: Staged changes · 3 files · 7 symbols · 12 dependents"* with a clickable link to the dependents panel.
- The banner is dismissible; the dependents panel auto-opens when reverse dependencies exist.

### 4.5. Intent Definition
* **Global Prompt Box:** The canvas includes a persistent, clean text area where the user types the actual instruction for the AI (e.g., "Refactor the authentication flow between these connected nodes").
* **Node-Specific Notes:** Users can attach sticky notes to specific nodes to give the AI localized context (e.g., "Ignore the deprecated method here").

### 4.5. Export and Bundling
* **Bundle Generation:** A primary "Generate Context" action compiles the visual graph into a highly optimized, structured text format (like Markdown or XML) that LLMs easily understand.
* **Output Destinations:** * **Copy to Clipboard:** Copies the entire bundled prompt + code to be pasted into an external web browser (ChatGPT, Claude web, etc.).
    * **Save to File:** Saves the bundle as a `.md` or `.txt` file in the workspace.
    * *(Future Scope)* **Direct API Call:** Send the bundled context directly to an LLM API or a local Small Language Model (SLM) running on the machine.