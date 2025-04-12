
import { useFormContext, Controller } from "react-hook-form";
import {
  FormControl,
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
import { 
  useFlavorOptions, 
  useLocaleOptions, 
  useStatusOptions 
} from "@/hooks/use-dropdown-options";
import { displayFormValue } from "@/utils/formFieldUtils";

export function MetadataSelects() {
  const form = useFormContext();
  const { data: flavorOptions } = useFlavorOptions();
  const { data: localeOptions } = useLocaleOptions();
  const { data: statusOptions } = useStatusOptions();

  return (
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
              value={typeof field.value === 'object' && field.value ? field.value.id : field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select flavor">
                    {displayFormValue(field.value)}
                  </SelectValue>
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
              onValueChange={(value) => {
                const selectedLocale = localeOptions?.find(locale => locale.name === value);
                field.onChange(selectedLocale || value);
              }} 
              value={typeof field.value === 'object' && field.value ? field.value.name : field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select locale">
                    {displayFormValue(field.value)}
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
      
      <Controller
        control={form.control}
        name="status"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Status</FormLabel>
            <Select 
              onValueChange={(value) => {
                const selectedStatus = statusOptions?.find(status => status.name === value);
                field.onChange(selectedStatus || value);
              }} 
              value={typeof field.value === 'object' && field.value ? field.value.name : field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select status">
                    {displayFormValue(field.value)}
                  </SelectValue>
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
  );
}
