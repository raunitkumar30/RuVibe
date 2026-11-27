import React from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

/**
 * Catches unexpected React render errors so the entire app never crashes to a blank screen.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorMessage: error?.message || "An unexpected error occurred.",
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error("RuVibe ErrorBoundary caught:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, errorMessage: "" });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-dvh w-screen bg-[#11121a] text-white flex items-center justify-center p-6 select-none">
          <div className="max-w-md w-full bg-[#161822] border border-white/10 rounded-3xl p-8 text-center shadow-2xl space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto">
              <AlertTriangle size={28} />
            </div>

            <div>
              <h1 className="text-xl font-extrabold tracking-tight">
                Something went wrong
              </h1>
              <p className="text-xs text-gray-400 mt-2 break-words">
                {this.state.errorMessage}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-200 transition-colors cursor-pointer"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-lg shadow-blue-600/30 transition-colors cursor-pointer"
              >
                <RotateCcw size={14} />
                <span>Reload RuVibe</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
