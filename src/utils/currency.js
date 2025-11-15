/**
 * Format number to Indonesian Rupiah currency format
 * @param {number|string} amount - The amount to format
 * @returns {string} Formatted currency string (e.g., "Rp50.000")
 */
export const formatRupiah = (amount) => {
  if (!amount && amount !== 0) return 'Rp0';
  
  const number = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  return `Rp${number.toLocaleString('id-ID')}`;
};
