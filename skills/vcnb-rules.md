# Visual Context Node Builder — AI Recipe Instructions

<!-- Universal rules file. Paste into your AI tool's rules/instructions config.
     Works with: Cursor (.cursorrules), GitHub Copilot (.github/copilot-instructions.md),
     Windsurf (.windsurfrules), or any AI tool that supports system-level instructions. -->

## What is a VCNB recipe?

The **Visual Context Node Builder** is a VS Code extension that lets developers visually
map their codebase on an infinite canvas and export structured context for AI assistants.

A **recipe** is a saved canvas layout stored as a JSON file in `.vcnb/recipes/`. When a
user asks you to "create a VCNB recipe", "build a visual context for...", or "map out
the code for...", you should search the codebase and generate this file.

## When to create a recipe

When the user asks you to:
- Create/build/generate a VCNB recipe or visual context
- Map out a feature, module, or workflow for AI context
- Update or modify an existing recipe
- List saved recipes

## How to create a recipe

### Step 1 — Search the codebase
Find every file relevant to the user's request:
- Entry points, core logic, types/interfaces, utilities, tests, config
- Follow import chains — if file A imports B, B is likely relevant
- Include adjacent files that provide critical context

### Step 2 — Write the recipe JSON
Save to `.vcnb/recipes/<slugified-name>.json`. The extension re-reads file contents from
disk when loading, so you do NOT need to include file content — just path metadata.

### Step 3 — Tell the user
Report the recipe name and instruct them to open it:
> Open the Visual Context Builder panel → Recipe Library → load "recipe-name"

## Recipe JSON Schema

```json
{
  "version": 1,
  "name": "Human-readable recipe name",
  "createdAt": "<ISO 8601 timestamp>",
  "intent": "A prompt describing what this context is for",
  "nodes": [],
  "edges": []
}
```

### Node types

**contextFile** — a source code file:
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
- `filePath`: absolute path in the workspace
- `symbols`, `selectedSymbols`, `content`: leave empty — the extension fills these on load
- `redacted`: set `true` for sensitive files

**stickyNote** — an annotation:
```json
{
  "id": "note-<unique>",
  "type": "stickyNote",
  "position": { "x": 0, "y": 0 },
  "data": { "text": "Explanation of why these files matter..." }
}
```

**systemInstruction** — a prompt preamble for the AI:
```json
{
  "id": "sys-<unique>",
  "type": "systemInstruction",
  "position": { "x": 0, "y": 0 },
  "data": { "text": "You are reviewing the auth module. Focus on..." }
}
```

**package** — type definitions from node_modules:
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

### Edges — dependency relationships
```json
{
  "id": "edge-<unique>",
  "source": "<source-node-id>",
  "target": "<target-node-id>",
  "type": "dependency"
}
```

## Layout guidelines

- **System instructions**: far left (`x: 0–200`)
- **Entry points**: left-center (`x: 400–600`)
- **Core logic**: center (`x: 800–1000`)
- **Utilities / helpers**: right (`x: 1200–1400`)
- **Types / interfaces**: bottom row
- **Sticky notes**: near the files they annotate, offset slightly
- **Packages**: far right (`x: 1600+`)
- Vertical spacing: ~200px between nodes
- Horizontal spacing: ~350px between columns

## File naming

Slugify the recipe name: lowercase, non-alphanumeric → hyphens, max 60 chars.
Example: `"Auth Flow Review"` → `.vcnb/recipes/auth-flow-review.json`

## Updating a recipe

Read the existing `.vcnb/recipes/<name>.json`, modify as requested, write back.
Preserve node IDs and positions for unchanged nodes.

## Listing recipes

Read all `.vcnb/recipes/*.json` files and present `name`, `createdAt`, and node count.

## Quality checklist

- All file paths are absolute and exist in the workspace
- Node IDs are unique
- Edge source/target IDs reference existing nodes
- Intent clearly describes the purpose
- Sticky notes add value (not just restating file names)
- Layout doesn't stack nodes on top of each other
- System instruction is present if the recipe has a clear AI task
