
import { ClientSelect } from "./ClientSelect";
import { JobTitleSelect } from "./JobTitleSelect";
import { MetadataSelects } from "./MetadataSelects";
import { RecruiterAndRate } from "./RecruiterAndRate";

interface JobFormBasicInfoProps {
  handleClientSelection: (clientName: string) => void;
}

export function JobFormBasicInfo({ handleClientSelection }: JobFormBasicInfoProps) {
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
