
import { Client } from "./types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Save, X } from "lucide-react";

interface EditableClientItemProps {
  client: Client;
  onUpdate: (updatedClient: Client) => void;
  onCancel: () => void;
}

export function EditableClientItem({ client, onUpdate, onCancel }: EditableClientItemProps) {
  const handleChange = (field: keyof Client, value: string) => {
    onUpdate({ ...client, [field]: value });
  };

  return (
    <TableRow>
      <TableCell>
        <Input 
          value={client.name}
          onChange={(e) => handleChange("name", e.target.value)}
        />
      </TableCell>
      <TableCell>
        <Input 
          value={client.abbreviation}
          onChange={(e) => handleChange("abbreviation", e.target.value)}
        />
      </TableCell>
      <TableCell>
        <Input 
          value={client.manager}
          onChange={(e) => handleChange("manager", e.target.value)}
        />
      </TableCell>
      <TableCell>
        <Input 
          value={client.description}
          onChange={(e) => handleChange("description", e.target.value)}
        />
      </TableCell>
      <TableCell>
        <div className="flex space-x-2">
          <Button size="sm" variant="outline" onClick={onUpdate}>
            <Save className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
