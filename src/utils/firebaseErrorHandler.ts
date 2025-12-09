/**
 * Utility to handle Firebase permission errors gracefully
 *
 * Instead of logging console errors that clutter the console,
 * this function silently tracks permission errors and can be used
 * to show user-friendly messages.
 */

export const handleFirebasePermissionError = (error: any, context: string): boolean => {
  // Check if this is a permission_denied error
  const isPermissionError =
    error?.message?.includes("permission_denied") ||
    error?.code === "PERMISSION_DENIED" ||
    String(error).includes("permission_denied");

  if (isPermissionError) {
    // Silently track permission errors without cluttering console
    // In a production app, you might want to send this to an error tracking service
    // console.debug(`Firebase permission error in ${context} - Rules need to be updated`);
    return true; // Indicates this was a permission error
  }

  // For other errors, log them normally
  console.error(`❌ Error in ${context}:`, error);
  return false;
};

/**
 * Check if an error is a Firebase permission error
 */
export const isFirebasePermissionError = (error: any): boolean => {
  return (
    error?.message?.includes("permission_denied") ||
    error?.code === "PERMISSION_DENIED" ||
    String(error).includes("permission_denied")
  );
};
