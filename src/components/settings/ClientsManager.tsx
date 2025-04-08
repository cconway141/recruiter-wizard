
import { useState } from "react";
import { ClientForm } from "./clients/ClientForm";
import { ClientsList } from "./clients/ClientsList";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export function ClientsManager() {
  const [isAdding, setIsAdding] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Client Management</h2>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} size="sm">
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Client
          </Button>
        )}
      </div>

      {isAdding ? (
        <ClientForm onCancel={() => setIsAdding(false)} onSuccess={() => setIsAdding(false)} />
      ) : (
        <ClientsList />
      )}
    </div>
  );
}
