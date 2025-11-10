/**
 * Utility function to display user names with optional nicknames
 * Format: "John Doe (Johnny)" if nickname exists, otherwise "John Doe"
 */

export function formatUserDisplayName(name: string, nickname?: string | null): string {
  if (nickname && nickname.trim()) {
    return `${name} (${nickname})`;
  }
  return name;
}
