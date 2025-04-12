
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
import { displayFormValue, extractId } from "@/utils/formFieldUtils";

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
        render={({ field }) => {
          // Get the value to display and the ID for selection
          const displayValue = displayFormValue(field.value);
          
          // Extract the ID value from the field value (either from object or string)
          let idValue = '';
          if (typeof field.value === 'object' && field.value) {
            idValue = field.value.id;
          } else if (field.value && typeof field.value === 'string') {
            try {
              // Try to parse it in case it's a stringified JSON
              const parsed = JSON.parse(field.value);
              if (parsed && parsed.id) {
                idValue = parsed.id;
              }
            } catch (e) {
              // If it's not a valid JSON string, use the extractId utility
              idValue = extractId(field.value);
            }
          }
          
          return (
            <FormItem>
              <FormLabel>Flavor</FormLabel>
              <Select 
                onValueChange={(value) => {
                  const selectedFlavor = flavorOptions?.find(flavor => flavor.id === value);
                  field.onChange(selectedFlavor);
                }} 
                value={idValue || ''}
                defaultValue={idValue || ''}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select flavor">
                      {displayValue}
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
          );
        }}
      />
      
      <Controller
        control={form.control}
        name="locale"
        render={({ field }) => {
          // Get the value to display and extract the name for selection
          const displayValue = displayFormValue(field.value);
          
          // Extract the name value for matching in the dropdown
          let nameValue = '';
          if (typeof field.value === 'object' && field.value) {
            nameValue = field.value.name;
          } else if (field.value && typeof field.value === 'string') {
            try {
              // Try to parse it in case it's a stringified JSON
              const parsed = JSON.parse(field.value);
              if (parsed && parsed.name) {
                nameValue = parsed.name;
              }
            } catch (e) {
              // If not a JSON string, use the value directly
              nameValue = field.value;
            }
          }
          
          return (
            <FormItem>
              <FormLabel>Locale</FormLabel>
              <Select 
                onValueChange={(value) => {
                  const selectedLocale = localeOptions?.find(locale => locale.name === value);
                  field.onChange(selectedLocale || value);
                }} 
                value={nameValue || ''}
                defaultValue={nameValue || ''}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select locale">
                      {displayValue}
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
          );
        }}
      />
      
      <Controller
        control={form.control}
        name="status"
        render={({ field }) => {
          // Get the value to display and extract the name for selection
          const displayValue = displayFormValue(field.value);
          
          // Extract the name value for matching in the dropdown
          let nameValue = '';
          if (typeof field.value === 'object' && field.value) {
            nameValue = field.value.name;
          } else if (field.value && typeof field.value === 'string') {
            try {
              // Try to parse it in case it's a stringified JSON
              const parsed = JSON.parse(field.value);
              if (parsed && parsed.name) {
                nameValue = parsed.name;
              }
            } catch (e) {
              // If not a JSON string, use the value directly
              nameValue = field.value;
            }
          }
          
          return (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select 
                onValueChange={(value) => {
                  const selectedStatus = statusOptions?.find(status => status.name === value);
                  field.onChange(selectedStatus || value);
                }} 
                value={nameValue || ''}
                defaultValue={nameValue || ''}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status">
                      {displayValue}
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
          );
        }}
      />
    </div>
  );
}
