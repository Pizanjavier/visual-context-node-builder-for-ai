# Changelog

## 0.2.1 — Production Readiness

### Added
- Design tokens system (`src/webview/theme/tokens.ts`) for centralized color/font management
- `useClickOutside` hook for closing dropdown menus on outside click
- `useStatePersistence` hook for webview state survival across hide/show cycles
- JSDoc documentation on all Zustand store exports
- Platform limitation documentation on `useFileDrop` hook
- Comprehensive test coverage for stores, XML/Markdown builders, and build-sections utility
- CDATA escaping for XML export (handles `]]>` in file content)

### Fixed
- Dropdown menus (Add, System/Templates) now close when clicking outside
- XML CDATA sections no longer break when file content contains `]]>`
- Removed `proOptions.hideAttribution` (requires React Flow Pro license)

### Changed
- Updated CLAUDE.md to document the actual styling convention (extracted style-object constants)
- Migrated hardcoded color/font values to shared design tokens across 10+ component files

## 0.2.0 — Prompt Workbench

- System instruction nodes for prompt engineering
- Built-in prompt templates (Code Review, Refactor, Bug Fix, Explain, New Feature)
- Package nodes for including npm package type definitions
- Recipe save/load/delete with workspace-local `.vcnb/recipes/` storage
- Recipe library browser with metadata display
- Confirmation modal (replaces native `window.confirm`)
- Help panel with keyboard shortcut reference
- Empty canvas hints for onboarding
- Tooltip guide for toolbar buttons
- Keyboard shortcuts: Delete nodes, Select All, Save Recipe, Escape to deselect

## 0.1.0 — Initial Release

- Interactive infinite canvas with React Flow
- Add files via Command Palette, file picker, or Explorer context menu
- Automatic TypeScript/JavaScript symbol extraction
- Dependency expansion (BFS, max depth 3)
- Symbol-level inclusion/exclusion with checkboxes
- Content redaction (privacy mode)
- Sticky notes for annotations
- Intent prompt for guiding AI context
- Export to Markdown or XML with token estimation
- Copy to clipboard or save to file
