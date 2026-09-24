import React from 'react';
import { Film, RefreshCw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#070913] text-white flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-[#0d1222] border border-rose-500/40 rounded-2xl p-8 text-center shadow-2xl space-y-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500">
              <Film className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black bg-gradient-to-r from-rose-400 to-amber-300 bg-clip-text text-transparent">
                Something went wrong
              </h2>
              <p className="text-sm text-slate-400">
                {this.state.error?.message || 'An unexpected rendering error occurred.'}
              </p>
            </div>

            <div className="flex items-center justify-center gap-4 pt-2">
              <button
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 text-white font-bold text-sm shadow-lg hover:brightness-110 transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Page
              </button>
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.href = '/';
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm border border-slate-700 transition-all"
              >
                <Home className="w-4 h-4" />
                Go to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
