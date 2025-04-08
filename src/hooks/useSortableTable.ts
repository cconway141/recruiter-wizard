
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
