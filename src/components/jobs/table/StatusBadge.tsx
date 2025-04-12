
import { Badge } from "@/components/ui/badge";

// Map status to badge color
const StatusBadgeColor: Record<string, string> = {
  Active: "bg-green-100 text-green-800 hover:bg-green-100",
  Aquarium: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  Inactive: "bg-orange-100 text-orange-800 hover:bg-orange-100",
  Closed: "bg-gray-100 text-gray-800 hover:bg-gray-100"
};

interface StatusBadgeProps {
  status: { id: string; name: string } | string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  // Handle both object and string formats for backward compatibility
  const statusName = typeof status === 'object' ? status.name : status;
  
  return (
    <Badge 
      className={StatusBadgeColor[statusName] || StatusBadgeColor.Active} 
      variant="outline"
    >
      {statusName}
    </Badge>
  );
}
