import { Component } from 'react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, retryCount: 0 };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  handleRetry = () => {
    this.setState(prev => ({
      hasError: false,
      retryCount: prev.retryCount + 1
    }));
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-4 p-8 text-center">
          <p className="text-foreground font-semibold">
            Halaman gagal dimuat.
          </p>
          <button
            onClick={this.handleRetry}
            className="btn-primary text-sm"
          >
            Coba Lagi
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
