import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * Error Boundary Component for graceful error handling
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    // Log error to console for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      const { darkMode, fallback, componentName } = this.props;
      
      // Custom fallback UI
      if (fallback) {
        return fallback;
      }

      return (
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-2xl p-8 border shadow-lg text-center`}>
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${darkMode ? 'bg-red-900/30' : 'bg-red-100'}`}>
            <AlertTriangle className={`${darkMode ? 'text-red-400' : 'text-red-600'}`} size={32} />
          </div>
          <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {componentName ? `Error loading ${componentName}` : 'Something went wrong'}
          </h3>
          <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            We encountered an issue displaying this section. Please try again.
          </p>
          <button
            onClick={this.handleRetry}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              darkMode 
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            <RefreshCw size={16} />
            Try Again
          </button>
          {import.meta.env.DEV && this.state.error && (
            <details className={`mt-4 text-left text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              <summary className="cursor-pointer">Error details (dev only)</summary>
              <pre className={`mt-2 p-2 rounded overflow-auto max-h-40 ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
                {this.state.error.toString()}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
