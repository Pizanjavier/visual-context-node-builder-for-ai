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

### 4.4. Intent Definition
* **Global Prompt Box:** The canvas includes a persistent, clean text area where the user types the actual instruction for the AI (e.g., "Refactor the authentication flow between these connected nodes").
* **Node-Specific Notes:** Users can attach sticky notes to specific nodes to give the AI localized context (e.g., "Ignore the deprecated method here").

### 4.5. Export and Bundling
* **Bundle Generation:** A primary "Generate Context" action compiles the visual graph into a highly optimized, structured text format (like Markdown or XML) that LLMs easily understand.
* **Output Destinations:** * **Copy to Clipboard:** Copies the entire bundled prompt + code to be pasted into an external web browser (ChatGPT, Claude web, etc.).
    * **Save to File:** Saves the bundle as a `.md` or `.txt` file in the workspace.
    * *(Future Scope)* **Direct API Call:** Send the bundled context directly to an LLM API or a local Small Language Model (SLM) running on the machine.