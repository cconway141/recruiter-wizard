
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
