import { useCallback, useEffect } from 'react';
import type {
  ExtensionToWebviewMessage,
  WebviewToExtensionMessage,
} from '../../shared/types/messages';

type VsCodeApi = {
  postMessage(message: WebviewToExtensionMessage): void;
  getState(): unknown;
  setState(state: unknown): void;
};

declare function acquireVsCodeApi(): VsCodeApi;

let vscodeApi: VsCodeApi | undefined;

function getApi(): VsCodeApi {
  if (!vscodeApi) {
    vscodeApi = acquireVsCodeApi();
  }
  return vscodeApi;
}

/** Hook providing typed postMessage communication with the extension host. */
export function useExtensionBridge(
  onMessage?: (msg: ExtensionToWebviewMessage) => void,
): { postMessage: (msg: WebviewToExtensionMessage) => void } {
  useEffect(() => {
    if (!onMessage) return;

    const handler = (event: MessageEvent<ExtensionToWebviewMessage>): void => {
      onMessage(event.data);
    };

    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [onMessage]);

  const postMessage = useCallback((msg: WebviewToExtensionMessage) => {
    getApi().postMessage(msg);
  }, []);

  return { postMessage };
}
