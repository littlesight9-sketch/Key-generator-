import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    message: '',
  };

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      message: error?.message || 'An unexpected application error occurred.',
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-dvh items-center justify-center bg-background p-4 text-foreground">
          <div
            role="alert"
            className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 text-center shadow-surface"
          >
            <h1 className="text-lg font-bold text-foreground">
              Something interrupted the session
            </h1>
            <p className="mt-2 text-sm text-muted">{this.state.message}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="cta-purple-btn mt-5 inline-flex min-h-11 items-center justify-center rounded-xl px-5 text-sm font-semibold text-primary-foreground cursor-pointer"
            >
              Reload Platform
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
