/**
 * Formats numbers into cricket auction currency units (Cr, Lakh, K, or INR)
 * e.g., 1000000000 -> ₹100 Cr
 *       25000000   -> ₹2.5 Cr
 *       5000000    -> ₹50 Lakh
 *       100000     -> ₹1 Lakh
 *       500        -> ₹500
 */
export function formatPurse(amount) {
  if (amount === undefined || amount === null) return '₹0';
  const num = Number(amount);
  if (isNaN(num)) return '₹0';

  if (Math.abs(num) >= 10000000) {
    const cr = (num / 10000000).toFixed(2).replace(/\.?0+$/, '');
    return `₹${cr} Cr`;
  }
  if (Math.abs(num) >= 100000) {
    const lakh = (num / 100000).toFixed(2).replace(/\.?0+$/, '');
    return `₹${lakh} Lakh`;
  }
  if (Math.abs(num) >= 1000) {
    return `₹${num.toLocaleString('en-IN')}`;
  }
  return `₹${num.toLocaleString('en-IN')}`;
}

/**
 * Returns exact INR with commas: ₹1,00,00,00,000
 */
export function formatFullINR(amount) {
  if (amount === undefined || amount === null) return '₹0';
  const num = Number(amount);
  if (isNaN(num)) return '₹0';
  return `₹${num.toLocaleString('en-IN')}`;
}
