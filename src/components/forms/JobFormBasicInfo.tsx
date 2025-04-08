import { useFormContext } from "react-hook-form";
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
import { Input } from "@/components/ui/input";
import { Locale, Flavor, JobStatus } from "@/types/job";
import { 
  useClientOptions, 
  useFlavorOptions, 
  useLocaleOptions, 
  useStatusOptions, 
  useUserOptions 
} from "@/hooks/use-dropdown-options";
import { useEffect } from "react";

interface JobFormBasicInfoProps {
  handleClientSelection: (clientName: string) => void;
}

export function JobFormBasicInfo({ handleClientSelection }: JobFormBasicInfoProps) {
  const form = useFormContext();
  
  const { data: clientOptions, isLoading: clientsLoading, error: clientsError } = useClientOptions();
  const { data: flavorOptions } = useFlavorOptions();
  const { data: localeOptions } = useLocaleOptions();
  const { data: statusOptions } = useStatusOptions();
  const { data: userOptions, isLoading: usersLoading } = useUserOptions();

  useEffect(() => {
    console.log("User options:", userOptions);
  }, [userOptions]);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="client"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Client</FormLabel>
              <Select 
                onValueChange={(value) => {
                  field.onChange(value);
                  handleClientSelection(value);
                }} 
                defaultValue={field.value}
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
        
        <FormField
          control={form.control}
          name="candidateFacingTitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter job title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField
          control={form.control}
          name="flavor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Flavor</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select flavor" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {flavorOptions?.map((flavor) => (
                    <SelectItem key={flavor.id} value={flavor.name}>
                      {flavor.label} ({flavor.name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="locale"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Locale</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select locale" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {localeOptions?.map((locale) => (
                    <SelectItem key={locale.id} value={locale.name}>
                      {locale.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {statusOptions?.map((status) => (
                    <SelectItem key={status.id} value={status.name}>
                      {status.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="owner"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Recruiter (Owner)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select recruiter" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-80 overflow-y-auto">
                  {usersLoading ? (
                    <SelectItem value="loading" disabled>Loading recruiters...</SelectItem>
                  ) : userOptions && userOptions.length > 0 ? (
                    userOptions.map((user) => (
                      <SelectItem key={user.id} value={user.display_name || `${user.first_name || ''} ${user.last_name || ''}`.trim()}>
                        {user.display_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email?.split('@')[0] || 'Unknown User'}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>No recruiters found</SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="rate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rate (US Onshore $/hr)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min={0} 
                  placeholder="Hourly rate" 
                  {...field} 
                  onChange={(e) => {
                    field.onChange(parseFloat(e.target.value) || 0);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
}
