/**
 * Utility functions for formatting numbers in the UI
 */

/**
 * Format a number with commas for thousands separators
 * @param num - The number to format
 * @returns Formatted string with commas (e.g., "10,000")
 */
export function formatNumber(num: number): string {
  return num.toLocaleString();
}

/**
 * Format a number with commas and exactly 2 decimal places
 * @param num - The number to format
 * @returns Formatted string with commas and 2 decimal places (e.g., "1,234.56")
 */
export function formatNumberWithDecimals(num: number): string {
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

/**
 * Format a number with commas and 1 decimal place
 * @param num - The number to format
 * @returns Formatted string with commas and 1 decimal place (e.g., "1,234.5")
 */
export function formatNumberWithOneDecimal(num: number): string {
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  });
}

/**
 * Format a number with commas and 4 decimal places (for very precise metrics)
 * @param num - The number to format
 * @returns Formatted string with commas and 4 decimal places (e.g., "1,234.5678")
 */
export function formatNumberWithFourDecimals(num: number): string {
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4
  });
}

/**
 * Format a score with exactly 2 decimal places (no commas for scores)
 * @param num - The score to format
 * @returns Formatted string with 2 decimal places (e.g., "85.00")
 */
export function formatScore(num: number): string {
  return num.toFixed(2);
}
