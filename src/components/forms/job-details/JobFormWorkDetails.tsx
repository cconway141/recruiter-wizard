
import { useFormContext } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocaleOptions } from "@/hooks/use-dropdown-options";

export function JobFormWorkDetails() {
  const form = useFormContext();
  const { data: localeOptions } = useLocaleOptions();
  const selectedLocale = form.watch("locale");
  
  // This component no longer renders editable fields for work and pay details
  // The information is instead pulled from the settings (locales table)
  
  return (
    <Card className="bg-muted/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-md">Work & Pay Details</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Work and payment details are managed in Settings → Locales and will be populated 
          automatically based on the selected locale: <span className="font-medium">{selectedLocale}</span>
        </p>

        {/* Fields are rendered as hidden inputs to maintain form structure */}
        <input type="hidden" {...form.register("workDetails")} />
        <input type="hidden" {...form.register("payDetails")} />
      </CardContent>
    </Card>
  );
}
