import { ReactFlowProvider } from '@xyflow/react';
import { Canvas } from './components/Canvas';
import { Toolbar } from './components/Toolbar';
import { IntentPrompt } from './components/IntentPrompt';
import { ExportPanel } from './components/ExportPanel';
import { RecipeLibrary } from './components/RecipeLibrary';
import { SaveRecipeModal } from './components/SaveRecipeModal';
import { PackageInputModal } from './components/PackageInputModal';
import { ConfirmModal } from './components/ConfirmModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ErrorToast } from './components/ErrorToast';
import { HelpPanel } from './components/HelpPanel';
import { EmptyCanvasHints } from './components/EmptyCanvasHints';
import { TooltipGuide } from './components/TooltipGuide';
import { GitSeedInfoBanner } from './components/GitSeedInfoBanner';
import { ScanProgressBar } from './components/ScanProgressBar';
import { GitDependentsPanel } from './components/GitDependentsPanel';
import { useMessageHandler } from './hooks/useMessageHandler';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useStatePersistence } from './hooks/useStatePersistence';
import { COLOR_BG_PRIMARY } from './theme/tokens';

const appStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  height: '100%',
  backgroundColor: COLOR_BG_PRIMARY,
  position: 'relative',
};

/** Root component for the Visual Context Node Builder webview. */
export function App(): React.ReactElement {
  useMessageHandler();
  useKeyboardShortcuts();
  useStatePersistence();

  return (
    <ErrorBoundary>
      <ReactFlowProvider>
        <div style={appStyle}>
          <Toolbar />
          <ScanProgressBar />
          <GitSeedInfoBanner />
          <Canvas />
          <GitDependentsPanel />
          <IntentPrompt />
          <ExportPanel />
          <RecipeLibrary />
          <SaveRecipeModal />
          <PackageInputModal />
          <EmptyCanvasHints />
          <TooltipGuide />
          <ConfirmModal />
          <HelpPanel />
          <ErrorToast />
        </div>
      </ReactFlowProvider>
    </ErrorBoundary>
  );
}
