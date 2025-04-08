
import { useState, useMemo } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { PageHeader } from "@/components/layout/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MessageTemplateTable } from "@/components/templates/MessageTemplateTable";
import { Search } from "lucide-react";
import { MessageTemplate } from "@/types/messageTemplate";

// Sample message templates data
const initialTemplates: MessageTemplate[] = [
  { 
    id: "G1", 
    category: "General", 
    situation: "Urgent EOD Role update", 
    message: "Client - Manager - Role - EOD URGENT (DATE)\n\nNAME/ROLE - Needs <blank> or we will fall behind, can you push forward tonight?" 
  },
  { id: "G2", category: "M1", situation: "No", message: "No problem! Best of luck on your journey this year!" },
  { id: "G3", category: "M2", situation: "Objection-Skill Block", message: "The skills block is very helpful and needs to be done before any other step, we'll need to have your personal view on your skills and level for each to ensure we are aligned, afterwards we can discuss next steps and any questions or concerns, how does that sound?" },
  { id: "G4", category: "M2", situation: "Objection-Job/Visa Details", message: "Take a look our pay details above for those sort of questions, let me know if you have any questions after that." },
  { id: "G5", category: "M2", situation: "Follow Up #1", message: "Hi! Just checking in :)" },
  { id: "G6", category: "M2", situation: "Follow Up #2", message: "Hey! Do you still have interest in this role?" },
  { id: "G7", category: "M2", situation: "Reject - Skills", message: "Thank you! Unfortunately, the client for this role requires more experience than you currently have on some of the core skills. We will keep you in mind for future roles, wishing you the best this year!" },
  { id: "G8", category: "M2", situation: "Reject - English", message: "Thank you! Unfortunately, the client for this role requires a higher level of English than you currently have. We will keep you in mind for future roles, wishing you the best this year!" },
  { id: "G9", category: "M2", situation: "Salary - Objection", message: "Hi {Candidate's Name}, the compensation for this role is flexible, as we're working with a client who's open to options depending on experience and fit. To make sure we're aligned, could you share your salary expectations or what's most important to you in a compensation package?\nLooking forward to hearing from you and having a transparent conversation!" },
  { id: "G10", category: "M3", situation: "Objection", message: "The video is the best next step before we can really finalize anything else, after this we quickly get on a call with me or my lead recruiter (just due to how busy the schedules are). So if you are interested and have time to record this asap I would appreciate it! This video is not shared with anyone & can be informal, how does that sound? I appreciate the effort you have put in :)" },
  { id: "G11", category: "M3", situation: "Delay", message: "Please double check the items requested above, can you send me those asap?" },
  { id: "G12", category: "M4", situation: "Call", message: "Could you hop onto this call here? I will be here working throughout the day, and we can discuss if you have time.\nhttps://meet.google.com/rec-oxgj-gyy" },
  { id: "G13", category: "M4", situation: "Salary - High Rate", message: "Given the competitive nature of this opportunity, a more flexible salary expectation could position you more favorably than other candidates.\nWould you be open to discussing this further? If so, could you share the lowest fair hourly rate you would consider for this role? My goal is to ensure alignment while maximizing your chances in the selection process.\n\nIt's always easier for us to consider an increase in 6months or after you start, so coming in lower is strategic. \n\nLet me know what you think." },
  { id: "G14", category: "Close", situation: "Closeout", message: "Thank you so much for your interest in the role and for the effort you put into your application. Unfortunately, the client has informed us that they're no longer reviewing or accepting candidates.\n\nIf this opens soon would you like us to let you know? It may open back up at any time for other team spots.\n\nThanks again for your time, and I hope we can stay in touch!" },
  // Add the rest of the templates here
];

export default function MessageTemplates() {
  const [templates, setTemplates] = useState<MessageTemplate[]>(initialTemplates);
  const [searchQuery, setSearchQuery] = useState("");

  // Filtered templates based on search query
  const filteredTemplates = useMemo(() => {
    if (!searchQuery) return templates;
    
    const query = searchQuery.toLowerCase();
    return templates.filter(template => 
      template.id.toLowerCase().includes(query) ||
      template.category.toLowerCase().includes(query) ||
      template.situation.toLowerCase().includes(query) ||
      template.message.toLowerCase().includes(query)
    );
  }, [templates, searchQuery]);

  // Handler for updating a template
  const handleUpdateTemplate = (updatedTemplate: MessageTemplate) => {
    setTemplates(prevTemplates => 
      prevTemplates.map(template => 
        template.id === updatedTemplate.id ? updatedTemplate : template
      )
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container py-10">
        <PageHeader 
          title="Generic Messages" 
          description="Standard templates for commonly used messages in candidate communications" 
        />

        {/* Search and filters */}
        <div className="mb-6 relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Templates table */}
        <MessageTemplateTable 
          templates={filteredTemplates} 
          onUpdateTemplate={handleUpdateTemplate} 
        />
      </main>
    </div>
  );
}
