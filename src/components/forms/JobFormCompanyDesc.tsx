
import { useFormContext } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useClientOptions } from "@/hooks/use-dropdown-options";

export function JobFormCompanyDesc() {
  const form = useFormContext();
  const { data: clientOptions } = useClientOptions();
  const selectedClient = form.watch("client");
  
  // Find the selected client to display information about it
  const clientInfo = clientOptions?.find(client => client.value === selectedClient);
  
  return (
    <Card className="bg-muted/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-md">Company Description</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Company descriptions are managed in Settings → Clients and will be populated 
          automatically based on the selected client: <span className="font-medium">{selectedClient}</span>
        </p>
        
        {/* Field is rendered as a hidden input to maintain form structure */}
        <input type="hidden" {...form.register("compDesc")} />
      </CardContent>
    </Card>
  );
}
