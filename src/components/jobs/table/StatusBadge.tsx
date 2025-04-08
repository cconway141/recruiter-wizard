
import { Badge } from "@/components/ui/badge";
import { JobStatus } from "@/types/job";

// Map status to badge color
const StatusBadgeColor: Record<JobStatus, string> = {
  Active: "bg-green-100 text-green-800 hover:bg-green-100",
  Aquarium: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  Inactive: "bg-orange-100 text-orange-800 hover:bg-orange-100",
  Closed: "bg-gray-100 text-gray-800 hover:bg-gray-100"
};

interface StatusBadgeProps {
  status: JobStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <Badge className={StatusBadgeColor[status] || ""} variant="outline">
      {status}
    </Badge>
  );
}
