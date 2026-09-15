import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught runtime error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <main className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center bg-aurora-mesh bg-grid-texture">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive shadow-sm">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <h2 className="font-heading text-2xl font-extrabold text-foreground">
            Something went wrong rendering this module
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-muted-foreground max-w-md leading-relaxed">
            {this.state.error?.message || "An unexpected rendering error occurred. You can reload the page or return to the dashboard."}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="rounded-xl font-bold gap-2 text-xs h-10"
            >
              <RefreshCw className="h-4 w-4" /> Reload Page
            </Button>
            <Button
              onClick={() => {
                this.setState({ hasError: false });
                window.location.href = "/";
              }}
              className="btn-cta-glow rounded-xl font-bold gap-2 text-xs h-10"
            >
              <Home className="h-4 w-4" /> Return to Home
            </Button>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
