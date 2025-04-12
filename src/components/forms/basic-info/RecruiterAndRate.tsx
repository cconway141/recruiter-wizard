
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
import { useUserOptions } from "@/hooks/useUserOptions";

export function RecruiterAndRate() {
  const form = useFormContext();
  const { data: userOptions, isLoading: usersLoading } = useUserOptions();

  return (
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
  );
}
