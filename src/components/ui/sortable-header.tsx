
import { TableHead } from "./table";
import { ArrowDownAZ, ArrowUpAZ } from "lucide-react";

interface SortableHeaderProps<T extends string> {
  title: string;
  field: T;
  currentField: T;
  direction: 'asc' | 'desc';
  onSort: (field: T) => void;
  width?: string;
}

export function SortableHeader<T extends string>({
  title,
  field,
  currentField,
  direction,
  onSort,
  width
}: SortableHeaderProps<T>) {
  const isCurrentField = currentField === field;
  
  return (
    <TableHead className={width}>
      <div 
        className="flex items-center cursor-pointer hover:text-primary transition-colors"
        onClick={() => onSort(field)}
      >
        {title}
        {isCurrentField && (
          direction === "asc" ? 
            <ArrowDownAZ className="h-4 w-4 ml-1" /> : 
            <ArrowUpAZ className="h-4 w-4 ml-1" />
        )}
      </div>
    </TableHead>
  );
}
