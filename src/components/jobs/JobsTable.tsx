
import { useJobs } from "@/contexts/JobContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SortableHeader } from "@/components/ui/sortable-header";
import { useSortableTable } from "@/hooks/useSortableTable";
import { Job } from "@/types/job";
import { StatusBadge } from "./table/StatusBadge";
import { MessageButtons } from "./table/MessageButtons";
import { TableActions } from "./table/TableActions";
import { EmptyTableRow } from "./table/EmptyTableRow";

export function JobsTable() {
  const { filteredJobs, deleteJob } = useJobs();
  
  // Add sorting functionality
  const { sortField, sortDirection, handleSort, sortedData } = 
    useSortableTable<Job, keyof Job>(
      filteredJobs,
      'internalTitle',
      'asc'
    );
  
  return (
    <div className="rounded-md border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <SortableHeader
              title="Title"
              field="internalTitle"
              currentField={sortField}
              direction={sortDirection}
              onSort={handleSort}
            />
            <SortableHeader
              title="Client"
              field="client"
              currentField={sortField}
              direction={sortDirection}
              onSort={handleSort}
            />
            <SortableHeader
              title="Status"
              field="status"
              currentField={sortField}
              direction={sortDirection}
              onSort={handleSort}
            />
            <SortableHeader
              title="Rate (US)"
              field="rate"
              currentField={sortField}
              direction={sortDirection}
              onSort={handleSort}
            />
            <SortableHeader
              title="Owner"
              field="owner"
              currentField={sortField}
              direction={sortDirection}
              onSort={handleSort}
            />
            <TableHead className="text-center">Messages</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.length === 0 ? (
            <EmptyTableRow />
          ) : (
            sortedData.map(job => (
              <TableRow key={job.id}>
                <TableCell className="font-medium">{job.internalTitle}</TableCell>
                <TableCell>{job.client}</TableCell>
                <TableCell>
                  <StatusBadge status={job.status} />
                </TableCell>
                <TableCell>${job.rate}/hr</TableCell>
                <TableCell>{job.owner}</TableCell>
                <TableCell>
                  <MessageButtons job={job} />
                </TableCell>
                <TableCell className="text-right">
                  <TableActions 
                    jobId={job.id} 
                    onDelete={deleteJob} 
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
