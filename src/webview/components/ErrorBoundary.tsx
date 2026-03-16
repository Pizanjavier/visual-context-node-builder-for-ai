import { Component, type ErrorInfo, type ReactNode } from 'react';

const CODE_FONT = '"JetBrains Mono", "Fira Code", "Cascadia Code", monospace';
const UI_FONT = 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  backgroundColor: '#1a1a1a',
  color: '#e2e2e2',
  fontFamily: UI_FONT,
  padding: '32px',
  textAlign: 'center',
};

const headingStyle: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: 600,
  color: '#d97706',
  marginBottom: '12px',
};

const messageStyle: React.CSSProperties = {
  fontSize: '12px',
  fontFamily: CODE_FONT,
  color: '#888888',
  backgroundColor: '#252525',
  border: '1px solid #333333',
  borderRadius: '3px',
  padding: '12px 16px',
  maxWidth: '500px',
  wordBreak: 'break-word',
  marginBottom: '16px',
};

const buttonStyle: React.CSSProperties = {
  padding: '6px 16px',
  backgroundColor: '#d97706',
  border: 'none',
  borderRadius: '2px',
  color: '#1a1a1a',
  fontSize: '12px',
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: UI_FONT,
};

type Props = { children: ReactNode };
type State = { hasError: boolean; errorMessage: string };

/**
 * Catches React render errors and displays a recovery UI.
 * Class component is required -- React has no hook-based error boundary API.
 */
// Implemented by: react-canvas agent
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[VCNB] React error boundary caught:', error, info.componentStack);
  }

  private handleReload = (): void => {
    this.setState({ hasError: false, errorMessage: '' });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div style={containerStyle}>
          <div style={headingStyle}>Something went wrong</div>
          <div style={messageStyle}>{this.state.errorMessage}</div>
          <button type="button" style={buttonStyle} onClick={this.handleReload}>
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
