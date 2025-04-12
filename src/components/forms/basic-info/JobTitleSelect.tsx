
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
import { useRoleAbbreviations } from "@/hooks/useRoleAbbreviations";
import { displayFormValue } from "@/utils/formFieldUtils";

export function JobTitleSelect() {
  const form = useFormContext();
  const { data: roleOptions, isLoading: rolesLoading } = useRoleAbbreviations();

  return (
    <FormField
      control={form.control}
      name="candidateFacingTitle"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Job Title</FormLabel>
          <Select 
            onValueChange={field.onChange} 
            defaultValue={field.value}
            value={field.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select job role">
                  {displayFormValue(field.value)}
                </SelectValue>
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
  );
}
