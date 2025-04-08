
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus } from "lucide-react";
import { useJobs } from "@/contexts/JobContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function JobsFilter() {
  const { filters, setFilters } = useJobs();

  const updateFilter = (key: string, value: string) => {
    setFilters({ [key]: value });
  };
  
  return (
    <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search jobs..." 
          className="pl-8"
          onChange={(e) => updateFilter("search", e.target.value)}
        />
      </div>
      
      <div className="flex gap-2 w-full md:w-auto">
        <Select 
          onValueChange={(value) => updateFilter("status", value)}
        >
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Statuses</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Aquarium">Aquarium</SelectItem>
            <SelectItem value="Inactive">Inactive</SelectItem>
            <SelectItem value="Closed">Closed</SelectItem>
          </SelectContent>
        </Select>
        
        <Select 
          onValueChange={(value) => updateFilter("flavor", value)}
        >
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Job Flavor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Flavors</SelectItem>
            <SelectItem value="FE">Frontend</SelectItem>
            <SelectItem value="BE">Backend</SelectItem>
            <SelectItem value="FS">Full Stack</SelectItem>
            <SelectItem value="DevOps">DevOps</SelectItem>
            <SelectItem value="Data">Data</SelectItem>
            <SelectItem value="ML">Machine Learning</SelectItem>
            <SelectItem value="Mobile">Mobile</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
        
        <Link to="/message-templates">
          <Button variant="outline">Message Templates</Button>
        </Link>
        
        <Link to="/jobs/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> New Job
          </Button>
        </Link>
      </div>
    </div>
  );
}
