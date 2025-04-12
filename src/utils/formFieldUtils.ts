
// Helper function to check if value is an object with a name property
function isNamedObject(value: any): value is { name: string } {
  return typeof value === 'object' && value !== null && 'name' in value;
}

// Helper function to check if value is an object with an id property
function isObjectWithId(value: any): value is { id: string } {
  return typeof value === 'object' && value !== null && 'id' in value;
}

// Helper function to try parsing a JSON string
function tryParseJSON(value: string): any | null {
  try {
    return JSON.parse(value);
  } catch (e) {
    return null;
  }
}

// Extract name from an object or return the string directly
export function extractName(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }
  
  // If it's a string, try to parse it as JSON if it looks like a stringified object
  if (typeof value === 'string') {
    if (value.startsWith('{') && value.includes('name')) {
      const parsed = tryParseJSON(value);
      if (parsed && parsed.name) {
        return parsed.name;
      }
    }
    return value;
  }
  
  // If it's an object with a name property, return the name
  if (isNamedObject(value)) {
    return value.name;
  }
  
  // Fallback to string conversion
  return String(value);
}

// Extract ID from an object or return empty string
export function extractId(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }
  
  // If it's a string that looks like JSON, try to parse it
  if (typeof value === 'string' && value.startsWith('{') && value.includes('id')) {
    const parsed = tryParseJSON(value);
    if (parsed && parsed.id) {
      return parsed.id;
    }
    return '';
  }
  
  // If it's a string but not JSON, it's likely not an ID
  if (typeof value === 'string') {
    return '';
  }
  
  // If it's an object with an id property, return the id
  if (isObjectWithId(value)) {
    return value.id;
  }
  
  return '';
}

export function displayFormValue(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }
  
  // Handle potentially stringified JSON objects
  if (typeof value === 'string' && value.startsWith('{')) {
    const parsed = tryParseJSON(value);
    if (parsed && parsed.name) {
      return parsed.name;
    }
    return value;
  }
  
  // If it's already a string matching our predefined types, return it
  const validStatuses: string[] = ['Active', 'Aquarium', 'Inactive', 'Closed'];
  const validLocales: string[] = ['Onshore', 'Nearshore', 'Offshore'];
  
  if (typeof value === 'string' && 
      (validStatuses.includes(value) || validLocales.includes(value))) {
    return value;
  }
  
  // If it's an object with a name property, return the name
  if (isNamedObject(value)) {
    return value.name;
  }
  
  // Fallback to string conversion
  return String(value);
}
