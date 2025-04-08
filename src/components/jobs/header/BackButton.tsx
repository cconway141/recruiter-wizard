
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const BackButton = () => {
  const navigate = useNavigate();
  
  return (
    <Button 
      variant="ghost" 
      onClick={() => navigate(-1)}
      className="mb-4"
    >
      <ArrowLeft className="mr-2 h-4 w-4" /> Back
    </Button>
  );
};
