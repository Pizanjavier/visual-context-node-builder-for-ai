import { createRoot } from 'react-dom/client';
import { App } from './App';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root element not found. Cannot mount webview.');
}

const root = createRoot(container);
root.render(<App />);
