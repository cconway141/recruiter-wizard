
import { useFormContext } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { displayFormValue } from "@/utils/formFieldUtils";

export function JobFormWorkDetails() {
  const form = useFormContext();
  
  // Only access these values if the form is available
  const localeValue = form?.watch ? form.watch("locale") : null;
  
  // Use the utility function to get safe display values
  const displayLocale = displayFormValue(localeValue);
  
  // Register the fields but don't display them as they're generated fields
  if (form?.register) {
    form.register("workDetails");
    form.register("payDetails");
  }

  return (
    <Card className="bg-muted/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-md">Work & Pay Details</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Work and pay details are generated automatically based on the locale: <span className="font-medium">{displayLocale || "None selected"}</span>
        </p>
      </CardContent>
    </Card>
  );
}
