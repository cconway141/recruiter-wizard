
import { displayFormValue } from "@/utils/formFieldUtils";

interface DisplayLocaleValueProps {
  value: any;
}

export function DisplayLocaleValue({ value }: DisplayLocaleValueProps) {
  // Always ensure we return a string representation of the value
  const displayValue = displayFormValue(value);
  return <>{displayValue}</>;
}
