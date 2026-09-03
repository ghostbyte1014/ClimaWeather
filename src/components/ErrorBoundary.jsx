import React from "react";

/**
 * ISO 25010 Reliability: React Error Boundary
 * Catches runtime errors anywhere in the child component tree to prevent whole-app crashes.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("WeatherApp ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-3xl border border-red-500/20 bg-red-500/5 p-6 text-center">
          <div className="mb-2 text-2xl">⚠️</div>
          <h2 className="text-base font-semibold text-red-600 dark:text-red-400">
            Something went wrong loading this component
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            {this.state.error?.message || "An unexpected error occurred."}
          </p>
          <button
            onClick={this.handleReset}
            className="mt-4 rounded-full bg-red-600 px-4 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-red-700"
          >
            Reset Component
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
