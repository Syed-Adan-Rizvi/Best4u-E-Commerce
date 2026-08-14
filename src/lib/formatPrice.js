// File Path: src/lib/formatPrice.js

/**
 * 💰 Price Formatter & Converter Helper
 * Yeh function USD price ko required currency mein convert karke symbol ke sath format karega.
 * 
 * @param {Number} priceInUSD - Database wali original USD price
 * @param {String} targetCurrency - Maslan 'PKR', 'EUR', 'INR'
 * @param {Object} rates - Zustand store se aane wale live rates object
 * @returns {String} - Formatted price (e.g., 'Rs 2,780.00' or '€9.50')
 */
export const formatPrice = (priceInUSD, targetCurrency = "USD", rates = { USD: 1 }) => {
  if (!priceInUSD) return "N/A";

  // 1. Current exchange rate nikalo (Agar nahi mila toh 1 use karo)
  const rate = rates[targetCurrency] || 1;
  
  // 2. Math Conversion (USD * Exchange Rate)
  const convertedPrice = priceInUSD * rate;
  
  // 3. JavaScript ka Jadoo: Auto comma aur Currency Symbol lagana
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: targetCurrency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(convertedPrice);
};