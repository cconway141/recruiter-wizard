
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { setupAirtable, getAirtableConfig, isAirtableConfigured } from "@/utils/airtableUtils";
import { toast } from "@/hooks/use-toast";

interface AirtableSetupProps {
  apiKey: string;
  baseId: string;
  setApiKey: React.Dispatch<React.SetStateAction<string>>;
  setBaseId: React.Dispatch<React.SetStateAction<string>>;
  handleSave: () => void;
  isConfigured: boolean;
}

export const AirtableSetup = ({
  apiKey,
  baseId,
  setApiKey,
  setBaseId,
  handleSave,
  isConfigured
}: AirtableSetupProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={isConfigured ? "outline" : "secondary"}>
          {isConfigured ? "Update Airtable Connection" : "Connect Airtable"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Airtable Integration</DialogTitle>
          <DialogDescription>
            Connect your Airtable account to sync job and candidate data.
            You'll need your Airtable API key and Base ID.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="apiKey" className="col-span-4">
              Airtable API Key
            </Label>
            <Input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Airtable API key"
              className="col-span-4"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="baseId" className="col-span-4">
              Airtable Base ID
            </Label>
            <Input
              id="baseId"
              value={baseId}
              onChange={(e) => setBaseId(e.target.value)}
              placeholder="Enter your Airtable Base ID"
              className="col-span-4"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
