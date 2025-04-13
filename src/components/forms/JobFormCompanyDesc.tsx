
import React, { useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useClientOptions } from "@/hooks/use-dropdown-options";
import { displayFormValue } from "@/utils/formFieldUtils";

export const JobFormCompanyDesc = React.memo(function JobFormCompanyDesc() {
  const form = useFormContext();
  const { data: clientOptions, isLoading } = useClientOptions();
  
  // Add null check before calling form methods
  const selectedClient = form && form.watch ? form.watch("client") : null;
  
  // Find the selected client to display information about it - use useMemo to prevent recalculation
  const clientInfo = useMemo(() => {
    return clientOptions?.find(client => 
      client.name === (typeof selectedClient === 'object' ? selectedClient?.name : selectedClient)
    );
  }, [clientOptions, selectedClient]);
  
  // Ensure we're displaying a string, not an object
  const displayClient = useMemo(() => {
    return displayFormValue(selectedClient);
  }, [selectedClient]);
  
  // Only log on mount or when client changes, not on every render
  // console.log("JobFormCompanyDesc rendering with client:", {
  //   selectedClient,
  //   displayClient,
  //   clientInfo
  // });
  
  return (
    <Card className="bg-muted/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-md">Company Description</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading client information...</p>
        ) : (
          <p className="text-sm text-muted-foreground mb-4">
            Company descriptions are managed in Settings → Clients and will be populated 
            automatically based on the selected client: <span className="font-medium">{displayClient || "None selected"}</span>
          </p>
        )}
        
        {/* Field is rendered as a hidden input to maintain form structure */}
        {form && form.register ? (
          <input type="hidden" {...form.register("compDesc")} />
        ) : null}
      </CardContent>
    </Card>
  );
});
