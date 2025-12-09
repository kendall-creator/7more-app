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
    // Show a one-time message about Firebase rules
    if (!hasShownFirebaseRulesMessage) {
      originalConsoleError.call(
        console,
        "\n⚠️ FIREBASE PERMISSION ERRORS DETECTED\n" +
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
        "Your Firebase security rules are blocking database access.\n" +
        "To fix this:\n" +
        "1. Open Firebase Console: https://console.firebase.google.com\n" +
        "2. Go to: Realtime Database → Rules\n" +
        "3. Update rules to allow access (see README.md for details)\n" +
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
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
