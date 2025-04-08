
import { TableCell, TableRow } from "@/components/ui/table";

export function EmptyTableRow() {
  return (
    <TableRow>
      <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
        No jobs found. Try adjusting your filters or add a new job.
      </TableCell>
    </TableRow>
  );
}
