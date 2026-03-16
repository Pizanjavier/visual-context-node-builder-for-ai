import type { ContextFileNodeData, PackageNodeData } from './nodes';
import type { CanvasSnapshot, RecipeMeta } from './snapshot';

// Extension -> Webview messages
export type ExtensionToWebviewMessage =
  | { type: 'init' }
  | { type: 'fileData'; data: ContextFileNodeData }
  | { type: 'dependencyFiles'; parentNodeId: string; files: ContextFileNodeData[] }
  | { type: 'packageData'; data: PackageNodeData }
  | { type: 'packageList'; packages: string[] }
  | { type: 'error'; message: string }
  | { type: 'recipeList'; recipes: RecipeMeta[] }
  | { type: 'recipeLoaded'; snapshot: CanvasSnapshot }
  | { type: 'recipeSaved'; name: string };

// Webview -> Extension messages
export type WebviewToExtensionMessage =
  | { type: 'ready' }
  | { type: 'requestFile'; filePath: string }
  | { type: 'pickFiles' }
  | { type: 'expandDependencies'; filePath: string; nodeId: string }
  | { type: 'resolvePackage'; packageName: string }
  | { type: 'listPackages' }
  | { type: 'copyToClipboard'; text: string }
  | { type: 'saveToFile'; content: string; format: 'md' | 'xml' }
  | { type: 'saveRecipe'; snapshot: CanvasSnapshot }
  | { type: 'loadRecipe'; fileName: string }
  | { type: 'listRecipes' }
  | { type: 'deleteRecipe'; fileName: string };

/** Union of all messages between extension host and webview. */
export type Message = ExtensionToWebviewMessage | WebviewToExtensionMessage;
