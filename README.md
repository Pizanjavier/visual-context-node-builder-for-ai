# Visual Context Node Builder for AI

A VS Code extension that provides an interactive infinite-canvas node graph for visually mapping, pruning, and bundling codebase context for AI coding assistants.

## Features

- Drag-and-drop infinite canvas powered by React Flow for mapping code relationships
- Automatic TypeScript/JavaScript symbol extraction with per-symbol inclusion control
- Dependency graph expansion with BFS traversal (configurable max depth)
- Privacy-first content redaction to exclude sensitive code from AI context
- Sticky notes for adding annotations and intent prompts to guide AI understanding
- Export to Markdown or XML with live token count estimation

## Requirements

- VS Code 1.85 or later

## Installation

Install from a `.vsix` file:

1. Download the `.vsix` package
2. Open VS Code
3. Run `Extensions: Install from VSIX...` from the Command Palette
4. Select the downloaded file

## Usage

1. Open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
2. Run **"Open Visual Context Builder"** to open the canvas
3. Add files using the toolbar button, Command Palette, or right-click a file in the Explorer and select **"Add to Visual Context"**
4. Select or deselect symbols within each file node to control what is included
5. Add sticky notes for context annotations
6. Click **"Generate Context"** to export as Markdown or XML
7. Copy the output to your clipboard or save it to a file

## Build from Source

```
npm install
npm run build
```

To run tests:

```
npm test
```

To package as `.vsix`:

```
npm run package
```

## License

MIT
