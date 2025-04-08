
/**
 * Calculate high, medium, and low rates from a base rate
 */
export function calculateRates(rate: number) {
  // Calculate rates
  const high = rate;
  const medium = Math.floor(rate * 0.85);
  const low = Math.floor(rate * 0.7);
  
  return { high, medium, low };
}
