
import { useEffect } from "react";
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
import { DEFAULT_WORK_DETAILS, DEFAULT_PAY_DETAILS, Locale } from "@/types/job";
import { getWorkDetails, getPayDetails } from "@/utils/localeUtils";

export function JobFormWorkDetails() {
  const form = useFormContext();
  const locale = form.watch("locale");
  
  // Ensure we're always displaying a string value
  const localeDisplay = displayFormValue(locale);
  
  // Get locale name for fetching the appropriate details
  const localeName = typeof locale === 'object' && locale ? locale.name : locale;
  
  // Update work and pay details when locale changes
  useEffect(() => {
    if (!localeName) return;
    
    // Set default values first
    const defaultWorkDetails = DEFAULT_WORK_DETAILS[localeName as Locale] || "";
    const defaultPayDetails = DEFAULT_PAY_DETAILS[localeName as Locale] || "";
    
    form.setValue("workDetails", defaultWorkDetails);
    form.setValue("payDetails", defaultPayDetails);
    
    // Then fetch from database if available
    const updateDetailsFromDB = async () => {
      try {
        const workDetails = await getWorkDetails(localeName as Locale);
        const payDetails = await getPayDetails(localeName as Locale);
        
        if (workDetails) form.setValue("workDetails", workDetails);
        if (payDetails) form.setValue("payDetails", payDetails);
      } catch (error) {
        console.error("Failed to fetch locale-specific details:", error);
      }
    };
    
    updateDetailsFromDB();
  }, [localeName, form]);

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
                <div className="p-3 min-h-[100px] bg-gray-50 border rounded-md text-sm">
                  {field.value || `Loading work details for ${localeDisplay}...`}
                </div>
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
                <div className="p-3 min-h-[100px] bg-gray-50 border rounded-md text-sm">
                  {field.value || `Loading pay details for ${localeDisplay}...`}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
