
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface EditButtonProps {
  jobId: string;
}

export const EditButton = ({ jobId }: EditButtonProps) => {
  const navigate = useNavigate();
  
  return (
    <Button onClick={() => navigate(`/jobs/edit/${jobId}`)}>
      <Pencil className="mr-2 h-4 w-4" /> Edit Job
    </Button>
  );
};
