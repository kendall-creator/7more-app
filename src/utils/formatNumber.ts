/**
 * Formats a number with commas for thousands separators
 * @param value - The number to format (can be number or string)
 * @param decimals - Optional number of decimal places to show
 * @returns Formatted string with commas
 */
export function formatNumber(value: number | string | null | undefined, decimals?: number): string {
  if (value === null || value === undefined || value === "") {
    return "0";
  }

  const num = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(num)) {
    return "0";
  }

  if (decimals !== undefined) {
    return num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Formats a currency value with dollar sign and commas
 * @param value - The currency amount to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted currency string
 */
export function formatCurrency(value: number | string | null | undefined, decimals: number = 2): string {
  return `$${formatNumber(value, decimals)}`;
}

/**
 * Formats a percentage value with % sign
 * @param value - The percentage to format
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number | string | null | undefined, decimals: number = 1): string {
  return `${formatNumber(value, decimals)}%`;
}
