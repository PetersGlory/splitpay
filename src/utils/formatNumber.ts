/**
 * Utility functions for formatting and handling numeric input
 */

/**
 * Format a number with commas for display
 * @param value - The number to format
 * @returns Formatted string with commas
 */
export function formatNumberWithCommas(value: number): string {
  if (isNaN(value) || value === null || value === undefined) {
    return '0';
  }
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
}

/**
 * Parse a formatted number string back to a number
 * Removes commas and converts to number
 * @param value - The formatted string to parse
 * @returns The parsed number
 */
export function parseFormattedNumber(value: string): number {
  if (!value || value.trim() === '') {
    return 0;
  }
  
  // Remove commas and parse
  const cleaned = value.replace(/,/g, '');
  const parsed = parseFloat(cleaned);
  
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Handle numeric input with formatting
 * Allows only numbers, decimal point, and commas
 * @param value - The input value to process
 * @returns Processed string that's safe for numeric input
 */
export function handleNumericInput(value: string): string {
  if (!value) {
    return '';
  }
  
  // Remove any non-numeric characters except decimal point and comma
  let cleaned = value.replace(/[^0-9.,]/g, '');
  
  // Ensure only one decimal point
  const parts = cleaned.split('.');
  if (parts.length > 2) {
    cleaned = parts[0] + '.' + parts.slice(1).join('');
  }
  
  // Format with commas for thousands
  const numberPart = cleaned.replace(/,/g, '');
  const number = parseFloat(numberPart);
  
  if (!isNaN(number)) {
    // Format with commas but preserve decimal places
    const formatted = number.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
    return formatted;
  }
  
  return cleaned;
}

/**
 * Format currency with symbol
 * @param amount - The amount to format
 * @param currencySymbol - The currency symbol to use
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currencySymbol: string = '$'): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return `${currencySymbol}0.00`;
  }
  
  return `${currencySymbol}${formatNumberWithCommas(amount)}`;
}
