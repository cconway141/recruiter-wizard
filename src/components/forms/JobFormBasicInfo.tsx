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
import { Input } from "@/components/ui/input";
import { 
  useClientOptions, 
  useFlavorOptions, 
  useLocaleOptions, 
  useStatusOptions,
} from "@/hooks/use-dropdown-options";
import { useUserOptions } from "@/hooks/useUserOptions";
import { useRoleAbbreviations } from "@/hooks/useRoleAbbreviations";
import { useEffect } from "react";
import { useState } from "react";

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
  const { data: roleOptions, isLoading: rolesLoading } = useRoleAbbreviations();

  useEffect(() => {
    console.log("User options:", userOptions);
    console.log("Role options:", roleOptions);
  }, [userOptions, roleOptions]);

  if (!form || !form.control) {
    return (
      <div className="p-4 border border-dashed rounded-md">
        <p className="text-center text-muted-foreground">Loading form...</p>
      </div>
    );
  }

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
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select job role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-80 overflow-y-auto">
                  {rolesLoading ? (
                    <SelectItem value="loading" disabled>Loading roles...</SelectItem>
                  ) : roleOptions && roleOptions.length > 0 ? (
                    roleOptions.map((role) => (
                      <SelectItem key={role.id} value={role.role_name}>
                        {role.role_name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>No roles found. Please add roles in Settings.</SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Controller
          control={form.control}
          name="flavor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Flavor</FormLabel>
              <Select 
                onValueChange={(value) => {
                  const selectedFlavor = flavorOptions?.find(flavor => flavor.id === value);
                  field.onChange(selectedFlavor);
                }} 
                value={field.value?.id}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select flavor" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {flavorOptions?.map((flavor) => (
                    <SelectItem key={flavor.id} value={flavor.id}>
                      {flavor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Controller
          control={form.control}
          name="locale"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Locale</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select locale">
                      {field.value}
                    </SelectValue>
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
                    userOptions.map((user) => {
                      const displayName = user.display_name || 
                        (user.first_name || user.last_name ? 
                          `${user.first_name || ''} ${user.last_name || ''}`.trim() : 
                          user.email?.split('@')[0]);
                      
                      return (
                        <SelectItem key={user.id} value={displayName || 'Unknown'}>
                          {displayName || 'Unknown User'}
                        </SelectItem>
                      );
                    })
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
                  onFocus={(e) => {
                    e.target.select();
                  }}
                  onChange={(e) => {
                    const value = e.target.value;
                    field.onChange(value === '' ? '' : parseFloat(value) || 0);
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
