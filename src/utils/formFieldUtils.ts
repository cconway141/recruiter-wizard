
// Helper function to check if a value is an object with a name property
function isNamedObject(value: any): value is { name: string } {
  return value !== null && 
         typeof value === 'object' && 
         'name' in value && 
         typeof value.name === 'string';
}

// Extract name from either a string or an object with a name property
export function extractName(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }
  
  if (typeof value === 'string') {
    return value;
  }
  
  if (isNamedObject(value)) {
    return value.name;
  }
  
  return String(value);
}

// Extract ID from either a string or an object with an id property
export function extractId(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }
  
  if (typeof value === 'string') {
    return value;
  }
  
  if (typeof value === 'object' && 'id' in value) {
    return String(value.id);
  }
  
  return '';
}

export function displayFormValue(value: any): string {
  if (value === null || value === undefined) {
    return '';
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
