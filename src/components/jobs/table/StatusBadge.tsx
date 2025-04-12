
import { Badge } from "@/components/ui/badge";
import { JobStatus } from "@/types/job";
import { displayFormValue } from "@/utils/formFieldUtils";

// Map status to badge color
const StatusBadgeColor: Record<string, string> = {
  Active: "bg-green-100 text-green-800 hover:bg-green-100",
  Aquarium: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  Inactive: "bg-orange-100 text-orange-800 hover:bg-blue-100",
  Closed: "bg-gray-100 text-gray-800 hover:bg-gray-100"
};

interface StatusBadgeProps {
  status: JobStatus | { id: string; name: string };
}

export function StatusBadge({ status }: StatusBadgeProps) {
  // Safely extract the status value using the utility function
  const statusValue = displayFormValue(status);
  
  return (
    <Badge className={StatusBadgeColor[statusValue] || ""} variant="outline">
      {statusValue}
    </Badge>
  );
}
