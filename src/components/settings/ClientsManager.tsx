
import { useState } from "react";
import { ClientForm } from "@/components/settings/clients/ClientForm";
import { ClientsList } from "@/components/settings/clients/ClientsList";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useClientOptions } from "@/hooks/use-dropdown-options";

export function ClientsManager() {
  const [isAdding, setIsAdding] = useState(false);
  const { data: clients, isLoading, refetch } = useClientOptions();

  const handleSubmitSuccess = () => {
    setIsAdding(false);
    refetch();
  };

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
        <ClientForm onCancel={() => setIsAdding(false)} onSubmit={handleSubmitSuccess} />
      ) : (
        <ClientsList clients={clients || []} isLoading={isLoading} onEdit={() => {}} onDelete={() => {}} />
      )}
    </div>
  );
}
