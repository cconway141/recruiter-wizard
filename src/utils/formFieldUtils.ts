
// Helper function to check if value is an object with a name property
function isNamedObject(value: any): value is { name: string } {
  return typeof value === 'object' && value !== null && 'name' in value;
}

// Helper function to check if value is an object with an id property
function isObjectWithId(value: any): value is { id: string } {
  return typeof value === 'object' && value !== null && 'id' in value;
}

// Extract name from an object or return the string directly
export function extractName(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }
  
  // If it's a string, return it directly
  if (typeof value === 'string') {
    return value;
  }
  
  // If it looks like a stringified JSON object, try to parse it
  if (typeof value === 'string' && value.startsWith('{') && value.includes('name')) {
    try {
      const parsed = JSON.parse(value);
      if (parsed && parsed.name) {
        return parsed.name;
      }
    } catch (e) {
      // Continue with normal processing if parsing fails
    }
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
  
  // If it's a string, check if it might be a JSON string with an id
  if (typeof value === 'string' && value.startsWith('{') && value.includes('id')) {
    try {
      const parsed = JSON.parse(value);
      if (parsed && parsed.id) {
        return parsed.id;
      }
    } catch (e) {
      // Continue with normal processing if parsing fails
    }
  }
  
  // If it's a string, it's likely not an ID
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
  if (typeof value === 'string' && value.startsWith('{') && value.includes('name')) {
    try {
      const parsed = JSON.parse(value);
      if (parsed && parsed.name) {
        return parsed.name;
      }
    } catch (e) {
      // If parsing fails, continue with normal processing
    }
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
