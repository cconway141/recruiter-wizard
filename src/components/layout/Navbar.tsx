
import { Button } from "@/components/ui/button";
import { Briefcase, Plus, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { UserNavButton } from "./UserNavButton";
import { useAuth } from "@/contexts/AuthContext";

export function Navbar() {
  const { user } = useAuth();

  return (
    <div className="border-b bg-white">
      <div className="container flex h-16 items-center px-4">
        <Link to="/" className="flex items-center gap-2 font-semibold text-lg text-recruiter-primary">
          <Briefcase className="h-6 w-6" />
          <span>Message Master</span>
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
            </>
          )}
          <UserNavButton />
        </div>
      </div>
    </div>
  );
}
