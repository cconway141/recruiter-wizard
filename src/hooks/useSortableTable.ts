
import { useState, useMemo } from 'react';

type SortDirection = 'asc' | 'desc';

export function useSortableTable<T extends Record<string, any>, K extends keyof T>(
  data: T[],
  defaultSortField: K,
  defaultDirection: SortDirection = 'asc'
) {
  const [sortField, setSortField] = useState<K>(defaultSortField);
  const [sortDirection, setSortDirection] = useState<SortDirection>(defaultDirection);

  const handleSort = (field: K) => {
    if (sortField === field) {
      // If already sorting by this field, toggle direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedData = useMemo(() => {
    if (!data.length) return [];
    
    return [...data].sort((a, b) => {
      // Special case for ID fields that might contain numbers (like G1, G10)
      if (sortField === 'id' as K && typeof a[sortField] === 'string' && typeof b[sortField] === 'string') {
        const aMatch = (a[sortField] as string).match(/([A-Za-z]+)(\d+)/);
        const bMatch = (b[sortField] as string).match(/([A-Za-z]+)(\d+)/);
        
        if (aMatch && bMatch && aMatch[1] === bMatch[1]) {
          // If prefixes match, compare the numeric parts
          const aNum = parseInt(aMatch[2]);
          const bNum = parseInt(bMatch[2]);
          return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
        }
      }
      
      // Default string comparison for other cases
      const aValue = a[sortField] ? String(a[sortField]).toLowerCase() : '';
      const bValue = b[sortField] ? String(b[sortField]).toLowerCase() : '';
      
      if (sortDirection === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });
  }, [data, sortField, sortDirection]);

  return {
    sortField,
    sortDirection,
    handleSort,
    sortedData
  };
}
