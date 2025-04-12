
/**
 * Extracts and displays the name from an object or returns the string directly
 */
export function displayFormValue(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }
  
  // If it's an object with a name property, return the name
  if (typeof value === 'object' && value !== null && 'name' in value) {
    return value.name;
  }
  
  // If it's a string, return it directly
  if (typeof value === 'string') {
    return value;
  }
  
  // Fallback to string conversion
  return String(value);
}

/**
 * Extracts the ID from an object if present
 */
export function extractId(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }
  
  // If it's an object with an id property, return the id
  if (typeof value === 'object' && value !== null && 'id' in value) {
    return value.id;
  }
  
  // If it's a string, return it as the ID
  if (typeof value === 'string') {
    return value;
  }
  
  return '';
}

/**
 * Extract name from an object or return the string directly
 */
export function extractName(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }
  
  // If it's an object with a name property, return the name
  if (typeof value === 'object' && value !== null && 'name' in value) {
    return value.name;
  }
  
  // If it's a string, return it directly
  if (typeof value === 'string') {
    return value;
  }
  
  // Fallback to string conversion
  return String(value);
}
