import React, { Component, ErrorInfo, ReactNode } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { logCrash } from "../utils/crashLogger";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary component to catch React component errors
 * Wrap your app or specific components with this to catch crashes
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the crash
    logCrash(error, {
      componentStack: errorInfo?.componentStack || "",
      errorBoundary: true,
    }).catch((logError) => {
      console.error("Failed to log crash:", logError);
    });

    this.setState({
      error,
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <View style={styles.container}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={styles.title}>⚠️ Something went wrong</Text>
            <Text style={styles.message}>
              The app encountered an error. The crash has been logged and will be reviewed.
            </Text>
            {__DEV__ && this.state.error && (
              <View style={styles.errorDetails}>
                <Text style={styles.errorTitle}>Error Details (Dev Mode):</Text>
                <Text style={styles.errorText}>{this.state.error.toString()}</Text>
                {this.state.errorInfo && (
                  <Text style={styles.stackText}>{this.state.errorInfo.componentStack}</Text>
                )}
              </View>
            )}
          </ScrollView>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#d32f2f",
    marginBottom: 16,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  errorDetails: {
    marginTop: 24,
    padding: 16,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#d32f2f",
  },
  errorText: {
    fontSize: 14,
    color: "#333",
    fontFamily: "monospace",
    marginBottom: 16,
  },
  stackText: {
    fontSize: 12,
    color: "#666",
    fontFamily: "monospace",
  },
});

