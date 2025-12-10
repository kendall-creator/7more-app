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

  // Check if this is a Firebase permission error
  const isFirebasePermissionError =
    errorString.includes("permission_denied") &&
    (errorString.includes("Client doesn't have permission") ||
     errorString.includes("Error in") ||
     errorString.includes("listener") ||
     errorString.includes("Firebase"));

  if (isFirebasePermissionError) {
    // Show a one-time message about Firebase rules using console.warn (not error)
    // to avoid triggering React Native's error handler
    if (!hasShownFirebaseRulesMessage) {
      console.warn(
        "Firebase permission errors detected. " +
        "Please update your Firebase security rules in the Firebase Console."
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
