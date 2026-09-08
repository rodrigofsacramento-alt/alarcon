import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  name?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg m-4 shadow-sm flex flex-col items-start gap-4 z-[9999] relative">
          <div className="flex items-center gap-2 text-red-600 font-semibold text-lg">
            <AlertCircle className="w-6 h-6" />
            Algo deu errado {this.props.name ? `em ${this.props.name}` : ''}
          </div>
          <div className="text-sm text-red-800 font-mono bg-red-100 p-4 rounded w-full overflow-auto max-h-60 text-left whitespace-pre-wrap">
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo?.componentStack}
          </div>
          <button 
            onClick={() => {
               this.setState({ hasError: false });
               window.location.reload();
            }}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            <RefreshCcw className="w-4 h-4" />
            Recarregar a página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
