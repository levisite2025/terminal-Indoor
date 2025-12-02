import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AlertTriangle } from 'lucide-react';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

interface ErrorBoundaryProps {
  children?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// LEVI STRUCTURE: Robust Error Boundary
// Prevents "White/Black Screen of Death" by catching render phase errors
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // Initialize state via class property for better TS compatibility
  public state: ErrorBoundaryState = { 
    hasError: false, 
    error: null 
  };
  
  // Explicitly declare props to fix "Property 'props' does not exist" error
  public props: ErrorBoundaryProps;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.props = props;
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to our polyfilled console
    console.error("Critical Application Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-slate-950 text-slate-200 flex flex-col items-center justify-center p-8 font-sans select-none">
          <div className="bg-slate-900 border border-red-900/50 p-8 rounded-xl shadow-2xl max-w-lg w-full text-center">
             <div className="mx-auto w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mb-6">
                <AlertTriangle size={32} className="text-red-500" />
             </div>
             
             <h1 className="text-xl font-bold text-white mb-2">System Runtime Error</h1>
             <p className="text-slate-400 text-sm mb-6">
               The application encountered an unexpected state and has halted to prevent data corruption.
             </p>
             
             <div className="bg-black/50 rounded p-4 text-left mb-6 overflow-auto max-h-32 border border-slate-800">
               <code className="text-xs font-mono text-red-300 block">
                 {this.state.error?.message || 'Unknown Error'}
               </code>
               <code className="text-[10px] font-mono text-slate-600 block mt-2">
                 Error Code: 0xCRITICAL_RENDER_FAIL
               </code>
             </div>
             
             <button 
               onClick={() => window.location.reload()}
               className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-blue-900/20"
             >
               Reboot System
             </button>
          </div>
          <div className="mt-8 text-xs text-slate-600 font-mono">
            Running in Safety Mode • Chrome/Edge Compatible
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);