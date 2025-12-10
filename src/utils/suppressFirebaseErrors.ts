/**
 * Suppress Firebase permission_denied errors from console
 *
 * This wraps console.error to filter out Firebase permission errors
 * that clutter the logs when Firebase security rules need updating.
 */

const originalConsoleError = console.error;

// Track if we've shown the Firebase rules message
let hasShownFirebaseRulesMessage = false;

console.error = (...args: any[]) => {
  // Convert all arguments to strings to check for permission errors
  const errorString = args.map(arg => String(arg)).join(" ");

  // Check if this is a Firebase-related error we should suppress
  const isFirebasePermissionError =
    errorString.includes("permission_denied") ||
    errorString.includes("Permission denied") ||
    errorString.includes("Direct fetch failed") ||
    errorString.includes("cannot connect to Firebase") ||
    errorString.includes("Error type:") ||
    errorString.includes("Error code:") ||
    errorString.includes("Error message:") ||
    errorString.includes("Real-time listener error") ||
    (errorString.includes("Firebase") &&
     (errorString.includes("error") || errorString.includes("Error")));

  if (isFirebasePermissionError) {
    // Show a one-time message about Firebase rules using console.warn (not error)
    // to avoid triggering React Native's error handler
    if (!hasShownFirebaseRulesMessage) {
      console.warn(
        "Firebase connection issue detected. " +
        "Please check your Firebase configuration and security rules."
      );
      hasShownFirebaseRulesMessage = true;
    }
    // Silently suppress the actual error messages
    return;
  }

  // For all other errors, call the original console.error
  originalConsoleError.apply(console, args);
};

export {};
