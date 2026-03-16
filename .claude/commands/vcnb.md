# Visual Context Node Builder — Recipe Manager

You are managing recipes for the **Visual Context Node Builder** VS Code extension.
A recipe is a saved canvas layout (JSON file) that users open in the extension to see
relevant files, notes, and instructions arranged on an interactive node graph.

**User request:** $ARGUMENTS

---

## What You Must Do

### 1. Understand the request

Parse what the user wants context for: a feature, a bug, a module, a workflow, etc.

### 2. Search the codebase

Use Glob and Grep to find every file relevant to the request. Be thorough:
- Entry points, core logic, types/interfaces, utilities, tests, config
- Follow import chains — if file A imports B, B is likely relevant
- Include adjacent files that provide critical context (shared types, constants)

### 3. Build the recipe JSON

Write a `.vcnb/recipes/<slugified-name>.json` file following the exact schema below.
The extension will re-read file contents from disk when the recipe loads, so you do NOT
need to include `content` in contextFile nodes — just the file path metadata.

### 4. Report what you created

Tell the user the recipe name and how to open it:
> Open the Visual Context Builder panel → Recipe Library → load "recipe-name"

---

## Recipe JSON Schema

```json
{
  "version": 1,
  "name": "Human-readable recipe name",
  "createdAt": "<ISO 8601 timestamp>",
  "intent": "A prompt describing what this context is for and what the AI should do with it",
  "nodes": [],
  "edges": []
}
```

### Node Types

There are 4 node types. Use the right mix for the recipe.

#### contextFile — a source code file

```json
{
  "id": "file-<unique>",
  "type": "contextFile",
  "position": { "x": 0, "y": 0 },
  "data": {
    "filePath": "/absolute/path/to/file.ts",
    "fileName": "file.ts",
    "relativePath": "src/utils/file.ts",
    "symbols": [],
    "selectedSymbols": [],
    "redacted": false,
    "content": ""
  }
}
```

- `filePath`: **absolute path** in the user's workspace. Since you're generating this in
  the project directory, use the full path you see when reading files.
- `symbols` and `selectedSymbols`: leave empty — the extension populates these on load.
- `content`: leave as `""` — the extension re-reads from disk on load.
- `redacted`: set `true` only if the file contains sensitive data the user shouldn't export.

#### stickyNote — an annotation or explanation

```json
{
  "id": "note-<unique>",
  "type": "stickyNote",
  "position": { "x": 0, "y": 0 },
  "data": {
    "text": "This module handles X. Key things to note: ..."
  }
}
```

Use sticky notes to explain **why** files are included, highlight important patterns,
warn about gotchas, or add context that isn't in the code itself.

#### systemInstruction — a prompt preamble for the AI

```json
{
  "id": "sys-<unique>",
  "type": "systemInstruction",
  "position": { "x": 0, "y": 0 },
  "data": {
    "text": "You are reviewing the authentication module. Focus on..."
  }
}
```

Use system instructions to set the AI's role, constraints, or focus area.
Place these on the left side of the canvas so they appear first in exports.

#### package — a type definition from node_modules

```json
{
  "id": "pkg-<unique>",
  "type": "package",
  "position": { "x": 0, "y": 0 },
  "data": {
    "packageName": "express",
    "version": "",
    "typesContent": "",
    "typesEntry": ""
  }
}
```

- Leave `version`, `typesContent`, `typesEntry` empty — the extension resolves these.
- Only include packages whose type signatures are essential for the AI to understand the code.

### Edges — relationships between nodes

```json
{
  "id": "edge-<unique>",
  "source": "<source-node-id>",
  "target": "<target-node-id>",
  "type": "dependency"
}
```

Create edges when file A imports/depends on file B. This shows the dependency structure
visually on the canvas and gets included in exports.

---

## Layout Guidelines

Arrange nodes so the graph is readable when opened:

- **System instructions**: far left (`x: 0–200`)
- **Entry points / main files**: left-center (`x: 400–600`)
- **Core logic**: center (`x: 800–1000`)
- **Utilities / helpers**: right (`x: 1200–1400`)
- **Types / interfaces**: bottom row
- **Sticky notes**: near the files they annotate, offset slightly
- **Packages**: far right (`x: 1600+`)
- Vertical spacing: ~200px between nodes
- Horizontal spacing: ~350px between columns

---

## File Naming

Recipe file names are slugified:
- Lowercase, replace non-alphanumeric with hyphens, strip leading/trailing hyphens
- Max 60 characters
- Example: `"Auth Flow Review"` → `auth-flow-review.json`
- Saved to: `.vcnb/recipes/auth-flow-review.json`

---

## Operations: Create, Update, List

### Creating a recipe
Search the codebase, build the JSON, write to `.vcnb/recipes/`.

### Updating a recipe
Read the existing `.vcnb/recipes/<name>.json`, modify nodes/edges/intent as requested,
write back. Preserve node IDs and positions for nodes that haven't changed.

### Listing recipes
Glob `.vcnb/recipes/*.json` and read each file's `name`, `createdAt`, and node count.
Present as a table.

---

## Quality Checklist

Before writing the recipe file, verify:
- [ ] All file paths are absolute and exist in the workspace
- [ ] Node IDs are unique
- [ ] Edge source/target IDs reference existing nodes
- [ ] Intent clearly describes the purpose
- [ ] Sticky notes add value (not just restating file names)
- [ ] Layout doesn't stack nodes on top of each other
- [ ] System instruction is present if the recipe has a clear AI task
