
import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { MessageCard } from "@/components/messages/MessageCard";
import { useJobs } from "@/contexts/JobContext";
import { ArrowLeft, ExternalLink, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const StatusBadgeColor = {
  Active: "bg-green-100 text-green-800 hover:bg-green-100",
  Aquarium: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  Inactive: "bg-orange-100 text-orange-800 hover:bg-orange-100",
  Closed: "bg-gray-100 text-gray-800 hover:bg-gray-100"
};

const ViewJob = () => {
  const { id } = useParams<{ id: string }>();
  const { getJob } = useJobs();
  const navigate = useNavigate();
  const job = id ? getJob(id) : undefined;

  useEffect(() => {
    if (id && !job) {
      // Job not found, redirect to dashboard
      navigate("/");
    }
  }, [id, job, navigate]);

  if (!job) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container py-10">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <div className="flex justify-between items-center">
            <PageHeader 
              title={job.internalTitle} 
              description={`Added on ${new Date(job.date).toLocaleDateString()} by ${job.owner}`}
            />
            <Button onClick={() => navigate(`/jobs/${job.id}/edit`)}>
              <Pencil className="mr-2 h-4 w-4" /> Edit Job
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
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
                  <Badge className={StatusBadgeColor[job.status] || ""} variant="outline">
                    {job.status}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-medium text-gray-500 mb-1">Candidate-Facing Title</h4>
                  <p>{job.candidateFacingTitle}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-500 mb-1">Locale</h4>
                  <p>{job.locale}</p>
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
                <h4 className="font-medium text-gray-500 mb-1">Job Description</h4>
                <div className="whitespace-pre-line p-4 bg-gray-50 rounded-md">{job.jd}</div>
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-500 mb-1">LinkedIn Search</h4>
                  <a 
                    href={job.linkedinSearch}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    Open LinkedIn Search <ExternalLink className="ml-1 h-4 w-4" />
                  </a>
                </div>
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
          </div>
          
          <div className="col-span-1">
            <div className="bg-white p-6 rounded-lg border mb-6">
              <h3 className="text-xl font-semibold mb-4 text-recruiter-primary">Work & Pay Details</h3>
              
              <div className="mb-4">
                <h4 className="font-medium text-gray-500 mb-1">Work Details</h4>
                <p className="whitespace-pre-line">{job.workDetails}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-500 mb-1">Pay Details</h4>
                <p className="whitespace-pre-line">{job.payDetails}</p>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-xl font-semibold mb-4 text-recruiter-primary">Screening Questions</h3>
              
              <div className="mb-4">
                <h4 className="font-medium text-gray-500 mb-1">Video Questions</h4>
                <p className="whitespace-pre-line">{job.videoQuestions}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-500 mb-1">Screening Questions</h4>
                <p className="whitespace-pre-line">{job.screeningQuestions}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-xl font-semibold mb-6 text-recruiter-primary">Messages for LinkedIn Outreach</h3>
          
          <div className="space-y-6">
            <MessageCard title="M1 - Initial Outreach" message={job.m1} />
            <MessageCard title="M2 - Detailed Information" message={job.m2} />
            <MessageCard title="M3 - Video & Final Questions" message={job.m3} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default ViewJob;
