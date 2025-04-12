
import { useFormContext, Controller } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useClientOptions } from "@/hooks/use-dropdown-options";

interface ClientSelectProps {
  handleClientSelection: (clientName: string) => void;
}

export function ClientSelect({ handleClientSelection }: ClientSelectProps) {
  const form = useFormContext();
  const { data: clientOptions, isLoading: clientsLoading, error: clientsError } = useClientOptions();

  return (
    <FormField
      control={form.control}
      name="client"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Client</FormLabel>
          <Select 
            onValueChange={(value) => {
              // Only trigger handleClientSelection for actual user-driven changes
              if (value !== field.value) {
                field.onChange(value);
                handleClientSelection(value);
              }
            }} 
            defaultValue={field.value}
            value={field.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select client" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {clientsLoading ? (
                <SelectItem value="loading" disabled>Loading clients...</SelectItem>
              ) : clientsError ? (
                <SelectItem value="error" disabled>Error loading clients</SelectItem>
              ) : clientOptions && clientOptions.length > 0 ? (
                clientOptions.map((client) => (
                  <SelectItem key={client.id} value={client.name}>
                    {client.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="none" disabled>No clients found</SelectItem>
              )}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
