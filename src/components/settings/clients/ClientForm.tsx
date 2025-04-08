
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Client } from "./types";

interface ClientFormProps {
  client?: Client;
  onSubmit: (client: any) => void; // Using 'any' to accommodate both Client and Omit<Client, "id">
  onCancel: () => void;
}

export function ClientForm({ client, onSubmit, onCancel }: ClientFormProps) {
  const [name, setName] = useState("");
  const [manager, setManager] = useState("");
  const [abbreviation, setAbbreviation] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If a client is provided, populate the form fields
  useEffect(() => {
    if (client) {
      setName(client.name);
      setManager(client.manager);
      setAbbreviation(client.abbreviation);
      setDescription(client.description);
    }
  }, [client]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = {
      name,
      manager,
      abbreviation,
      description,
      ...(client && { id: client.id })
    };

    onSubmit(formData);
    
    // Only reset the form if we're adding a new client (not editing)
    if (!client) {
      setName("");
      setManager("");
      setAbbreviation("");
      setDescription("");
    }
    
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">
            Client Name
          </label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter client name"
            required
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="abbreviation" className="text-sm font-medium">
            Abbreviation
          </label>
          <Input
            id="abbreviation"
            value={abbreviation}
            onChange={(e) => setAbbreviation(e.target.value)}
            placeholder="Enter abbreviation (e.g., ACME)"
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <label htmlFor="manager" className="text-sm font-medium">
          Manager
        </label>
        <Input
          id="manager"
          value={manager}
          onChange={(e) => setManager(e.target.value)}
          placeholder="Enter manager name"
          required
        />
      </div>
      
      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">
          Description
        </label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter client description"
          rows={3}
        />
      </div>
      
      <div className="flex justify-end space-x-2">
        {client && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {client ? "Update Client" : "Add Client"}
        </Button>
      </div>
    </form>
  );
}
