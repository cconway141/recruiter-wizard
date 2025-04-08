
import { Button } from "@/components/ui/button";
import { Plus, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { UserNavButton } from "./UserNavButton";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const { user } = useAuth();

  return (
    <div className="border-b bg-white">
      <div className="container flex h-16 items-center px-4">
        <Link to="/" className="flex items-center gap-2 font-semibold text-lg text-recruiter-primary">
          <img 
            src="/lovable-uploads/4add4393-d8ec-4a30-970d-3bc3ad2bcd83.png" 
            alt="The IT Bootcamp Logo" 
            className="h-8 w-8"
          />
          <span>The ITBC Recruitment Wizard</span>
        </Link>
        <div className="ml-auto flex items-center gap-4">
          {user && (
            <>
              <Link to="/jobs/new">
                <Button className="bg-recruiter-secondary hover:bg-recruiter-accent text-white">
                  <Plus className="mr-2 h-4 w-4" /> Add Job
                </Button>
              </Link>
              <Link to="/settings">
                <Button variant="ghost" size="icon">
                  <Settings className="h-5 w-5" />
                </Button>
              </Link>
              <UserNavButton />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
