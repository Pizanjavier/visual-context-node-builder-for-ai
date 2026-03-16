# Visual Context Node Builder for AI

**Stop blindly pasting files into ChatGPT.** Take control of exactly what your AI sees.

An infinite-canvas node graph inside VS Code where you visually map your codebase, prune what's irrelevant, and export a perfectly structured context bundle — ready for any AI coding assistant.

![Demo](demo.gif)

## Why This Exists

Every AI coding tool has the same problem: **context**. You either dump entire files and burn tokens, or you manually copy-paste snippets and lose the big picture. Neither works well.

This extension gives you a visual workspace to **see** your code relationships, **choose** exactly what goes in, and **export** a clean, structured prompt — with full control over every line.

## Key Features

### Node Graph Canvas
Drop files from the Explorer onto an infinite canvas. Each node shows the file's exports — functions, classes, types — and lets you toggle individual symbols on/off. Only include what matters.

### One-Click Dependency Expansion
Hit **Expand Deps** on any file node and watch its import tree unfold across the canvas. Filter by category (source, styles, data) so you don't drown in noise.

### Package Type Resolution
Need the AI to understand your dependencies? Add packages directly — the extension resolves `.d.ts` type definitions from `node_modules` and displays them inline.

### Privacy Redaction
Mark any node as redacted. Its content becomes `[REDACTED FOR PRIVACY]` in the export — the file stays in the graph for structural context, but sensitive code never leaves your machine.

### System Templates
Pre-built instruction sets for common tasks: **Code Review**, **Refactor**, **Bug Fix**, **Explain Code**, and **New Feature**. One click to set the AI's role and constraints.

### Recipes
Save your canvas layouts as reusable recipes. Next time you need the same context setup, load it in one click instead of rebuilding from scratch.

### Live Token Estimation
A running token count updates as you add, remove, or modify nodes. Know exactly how much context you're sending before you send it.

### Structured Export
Generate your context as **Markdown** or **XML** — optimized for how LLMs parse structured input. Copy to clipboard or save to file.

## Getting Started

1. Install the extension
2. Open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
3. Run **"Open Visual Context Builder"**
4. Right-click any file in the Explorer and select **"Add to Visual Context"**
5. Expand dependencies, prune nodes, write your prompt
6. Click **Generate Context** and paste into your AI assistant of choice

## Requirements

- VS Code 1.85+

## Build from Source

```bash
npm install
npm run build
```

```bash
npm test        # run tests
npm run package # create .vsix
```

## License

MIT
