
import React from "react";
import { ExternalLink, ChevronDown } from "lucide-react";
import { Job } from "@/types/job";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { displayFormValue } from "@/utils/formFieldUtils";
import { StatusBadge } from "./table/StatusBadge";

interface JobDetailsProps {
  job: Job;
}

export const JobDetails: React.FC<JobDetailsProps> = ({ job }) => {
  return (
    <div className="col-span-1 lg:col-span-2">
      <div className="bg-white p-6 rounded-lg border mb-8">
        <h3 className="text-xl font-semibold mb-4 text-recruiter-primary">Job Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h4 className="font-medium text-gray-500 mb-1">Client</h4>
            <p className="text-lg">{job.client}</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-500 mb-1">Status</h4>
            <StatusBadge status={job.status} />
          </div>
          <div>
            <h4 className="font-medium text-gray-500 mb-1">Candidate-Facing Title</h4>
            <p>{job.candidateFacingTitle}</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-500 mb-1">Locale</h4>
            <p>{displayFormValue(job.locale)}</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-500 mb-1">Owner</h4>
            <p>{job.owner}</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-500 mb-1">Rate (US Onshore)</h4>
            <p className="text-lg font-medium">${job.rate}/hr</p>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-3 bg-gray-50 rounded-md">
            <h4 className="text-sm font-medium text-gray-500">High Rate</h4>
            <p className="text-lg font-semibold">${job.highRate}/hr</p>
            <p className="text-xs text-gray-500">(55% of US rate)</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-md">
            <h4 className="text-sm font-medium text-gray-500">Medium Rate</h4>
            <p className="text-lg font-semibold">${job.mediumRate}/hr</p>
            <p className="text-xs text-gray-500">(40% of US rate)</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-md">
            <h4 className="text-sm font-medium text-gray-500">Low Rate</h4>
            <p className="text-lg font-semibold">${job.lowRate}/hr</p>
            <p className="text-xs text-gray-500">(20% of US rate)</p>
          </div>
        </div>
        
        <div className="mb-6">
          <h4 className="font-medium text-gray-500 mb-1">Company Description</h4>
          <p className="whitespace-pre-line">{job.compDesc}</p>
        </div>
        
        <div className="mb-6">
          <div className="flex items-center justify-start">
            <h4 className="font-medium text-gray-500 mr-2">Job Description</h4>
            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-gray-500 hover:bg-gray-100"
                >
                  <ChevronDown className="h-4 w-4 transition-transform duration-200 [&[data-state=open]>svg]:rotate-180" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="whitespace-pre-line p-4 bg-gray-50 rounded-md">
                  {job.jd}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-500 mb-1">Skills Sought</h4>
            <div className="whitespace-pre-line">{job.skillsSought}</div>
          </div>
          <div>
            <h4 className="font-medium text-gray-500 mb-1">Minimum Skills</h4>
            <div className="whitespace-pre-line">{job.minSkills}</div>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-xl font-semibold mb-4 text-recruiter-primary">LinkedIn Resources</h3>
        
        <div>
          <h4 className="font-medium text-gray-500 mb-1">LinkedIn Recruiter Project</h4>
          <a 
            href={job.lir}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 flex items-center"
          >
            Open LIR Project <ExternalLink className="ml-1 h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
};
