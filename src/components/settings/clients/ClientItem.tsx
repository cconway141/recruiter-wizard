
import { useState } from "react";
import { Client } from "./types";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Pencil, Trash } from "lucide-react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ClientItemProps {
  client: Client;
  onEdit: (client: Client) => void;
  onDelete: (id: string) => void;
}

export function ClientItem({ client, onEdit, onDelete }: ClientItemProps) {
  return (
    <TableRow>
      <TableCell>{client.name}</TableCell>
      <TableCell>{client.abbreviation}</TableCell>
      <TableCell>{client.manager}</TableCell>
      <TableCell className="max-w-[200px] truncate">{client.description}</TableCell>
      <TableCell>
        <div className="flex space-x-2">
          <Button size="sm" variant="outline" onClick={() => onEdit(client)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Trash className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Client</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{client.name}"? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(client.id)}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </TableCell>
    </TableRow>
  );
}
