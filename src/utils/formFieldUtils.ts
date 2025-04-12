
/**
 * Type guard to check if a value is a named object with id and name properties
 */
export function isNamedObject(value: any): value is { id: string; name: string } {
  return value && typeof value === 'object' && 'name' in value;
}

/**
 * Safely extracts the name property from an object or returns the value itself if it's a string
 */
export function extractName(value: any): string {
  if (isNamedObject(value)) {
    return value.name;
  }
  return typeof value === 'string' ? value : '';
}

/**
 * Safely extracts the id property from an object or returns empty string
 */
export function extractId(value: any): string {
  if (isNamedObject(value)) {
    return value.id;
  }
  return '';
}

/**
 * Creates a consistent object format from various input formats
 */
export function createNamedObject(value: string | { id: string; name: string } | undefined): { id: string; name: string } {
  if (isNamedObject(value)) {
    return value;
  }
  return { 
    id: '', 
    name: typeof value === 'string' ? value : '' 
  };
}

/**
 * Handles form value display safely
 */
export function displayFormValue(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }
  
  if (isNamedObject(value)) {
    return value.name;
  }
  
  return String(value);
}
