
import { useFormContext } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { DisplayLocaleValue } from "@/components/ui/display-locale-value";
import { displayFormValue } from "@/utils/formFieldUtils";

export function JobFormWorkDetails() {
  const form = useFormContext();
  const locale = form.watch("locale");
  
  // Ensure we're always displaying a string value
  const localeDisplay = displayFormValue(locale);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-md">Work & Pay Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-muted-foreground mb-4">
          Please provide details about the work arrangement and payment details for this {localeDisplay} role.
        </p>

        <FormField
          control={form.control}
          name="workDetails"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Work Details</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter work details..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="payDetails"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pay Details</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter payment details..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
