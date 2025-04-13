
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
  useStatusOptions,
  LocaleOption
} from "@/hooks/use-dropdown-options";
import { displayFormValue } from "@/utils/formFieldUtils";
import { useMemo, memo } from "react";

export const MetadataSelects = memo(function MetadataSelects() {
  const form = useFormContext();
  const { data: flavorOptions, isLoading: flavorLoading } = useFlavorOptions();
  const { data: localeOptions, isLoading: localeLoading } = useLocaleOptions();
  const { data: statusOptions, isLoading: statusLoading } = useStatusOptions();

  // Memoize options to prevent unnecessary re-renders
  const memoizedFlavorOptions = useMemo(() => flavorOptions || [], [flavorOptions]);
  const memoizedLocaleOptions = useMemo(() => localeOptions || [], [localeOptions]);
  const memoizedStatusOptions = useMemo(() => statusOptions || [], [statusOptions]);

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
                const selectedFlavor = memoizedFlavorOptions.find(flavor => flavor.id === value);
                field.onChange({
                  id: value,
                  name: selectedFlavor?.name || value
                });
              }} 
              value={field.value?.id || ''}
              disabled={flavorLoading}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select flavor">
                    {flavorLoading ? 'Loading...' : displayFormValue(field.value)}
                  </SelectValue>
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {memoizedFlavorOptions.map((flavor) => (
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
                const selectedLocale = memoizedLocaleOptions.find(locale => locale.name === value) as LocaleOption | undefined;
                field.onChange({
                  id: selectedLocale?.id || value,
                  name: value,
                  abbreviation: selectedLocale?.abbreviation || '',
                  workDetails: selectedLocale?.workDetails || '',
                  payDetails: selectedLocale?.payDetails || ''
                });
              }} 
              value={field.value?.name || ''}
              disabled={localeLoading}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select locale">
                    {localeLoading ? 'Loading...' : displayFormValue(field.value)}
                  </SelectValue>
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {memoizedLocaleOptions.map((locale) => (
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
                const selectedStatus = memoizedStatusOptions.find(status => status.name === value);
                field.onChange({
                  id: selectedStatus?.id || value,
                  name: value
                });
              }} 
              value={field.value?.name || ''}
              disabled={statusLoading}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select status">
                    {statusLoading ? 'Loading...' : displayFormValue(field.value)}
                  </SelectValue>
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {memoizedStatusOptions.map((status) => (
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
});
