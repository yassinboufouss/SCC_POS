import i18n from 'i18next';

/**
 * Formats a number as a currency string using the symbol defined in i18n translations.
 * @param amount The numeric amount.
 * @returns Formatted currency string (e.g., "123.45 MAD" or "123.45 د.م.").
 */
export const formatCurrency = (amount: number): string => {
  const symbol = i18n.t('currency_symbol');
  const formattedAmount = amount.toFixed(2);
  
  // For Arabic (RTL), place the symbol after the amount.
  if (i18n.language === 'ar') {
    return `${formattedAmount} ${symbol}`;
  }
  
  // For LTR languages, place the symbol after the amount (common for MAD).
  return `${formattedAmount} ${symbol}`;
};