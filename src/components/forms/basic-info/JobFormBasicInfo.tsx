
import { useFormContext } from "react-hook-form";
import { ClientSelect } from "./ClientSelect";
import { JobTitleSelect } from "./JobTitleSelect";
import { MetadataSelects } from "./MetadataSelects";
import { RecruiterAndRate } from "./RecruiterAndRate";

interface JobFormBasicInfoProps {
  handleClientSelection: (clientName: string) => void;
}

export function JobFormBasicInfo({ handleClientSelection }: JobFormBasicInfoProps) {
  const form = useFormContext();
  
  if (!form || !form.control) {
    return (
      <div className="p-4 border border-dashed rounded-md">
        <p className="text-center text-muted-foreground">Loading form...</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ClientSelect handleClientSelection={handleClientSelection} />
        <JobTitleSelect />
      </div>
      <MetadataSelects />
      <RecruiterAndRate />
    </>
  );
}
