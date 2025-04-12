
import { displayFormValue } from "@/utils/formFieldUtils";

interface DisplayLocaleValueProps {
  value: any;
}

export function DisplayLocaleValue({ value }: DisplayLocaleValueProps) {
  return <>{displayFormValue(value)}</>;
}
