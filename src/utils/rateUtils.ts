
/**
 * Calculate high, medium, and low rates from a base rate
 * High = 55% of US rate
 * Medium = 40% of US rate
 * Low = 20% of US rate
 */
export function calculateRates(rate: number) {
  // Calculate rates based on percentages of US rate
  const high = Math.round(rate * 0.55 * 10) / 10;  // 55% of US rate, rounded to 1 decimal place
  const medium = Math.round(rate * 0.4 * 10) / 10; // 40% of US rate, rounded to 1 decimal place
  const low = Math.round(rate * 0.2 * 10) / 10;    // 20% of US rate, rounded to 1 decimal place
  
  return { high, medium, low };
}
