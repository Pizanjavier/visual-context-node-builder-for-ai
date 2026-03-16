import { create } from 'zustand';
import { estimateTokens } from '../../shared/utils/token-estimator';

export type ExportFormat = 'md' | 'xml';

export type ExportState = {
  isOpen: boolean;
  format: ExportFormat;
  mdPreview: string;
  xmlPreview: string;
  tokenCount: number;
  open: (md: string, xml: string) => void;
  close: () => void;
  setFormat: (format: ExportFormat) => void;
};

/**
 * Store for managing the export/preview panel state.
 * Holds generated Markdown and XML previews along with
 * token count estimates and the currently selected format.
 */
export const useExportStore = create<ExportState>((set, get) => ({
  isOpen: false,
  format: 'md',
  mdPreview: '',
  xmlPreview: '',
  tokenCount: 0,

  open: (md, xml) => {
    set({
      isOpen: true,
      mdPreview: md,
      xmlPreview: xml,
      tokenCount: estimateTokens(md),
    });
  },

  close: () => {
    set({ isOpen: false, mdPreview: '', xmlPreview: '', tokenCount: 0 });
  },

  setFormat: (format) => {
    const state = get();
    const text = format === 'md' ? state.mdPreview : state.xmlPreview;
    set({ format, tokenCount: estimateTokens(text) });
  },
}));
