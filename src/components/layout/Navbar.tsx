
import { Button } from "@/components/ui/button";
import { Briefcase, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { UserNavButton } from "./UserNavButton";

export function Navbar() {
  return (
    <div className="border-b bg-white">
      <div className="container flex h-16 items-center px-4">
        <Link to="/" className="flex items-center gap-2 font-semibold text-lg text-recruiter-primary">
          <Briefcase className="h-6 w-6" />
          <span>Message Master</span>
        </Link>
        <div className="ml-auto flex items-center gap-4">
          <Link to="/jobs/new">
            <Button className="bg-recruiter-secondary hover:bg-recruiter-accent text-white">
              <Plus className="mr-2 h-4 w-4" /> Add Job
            </Button>
          </Link>
          <UserNavButton />
        </div>
      </div>
    </div>
  );
}
