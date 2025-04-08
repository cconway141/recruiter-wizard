
import { useState, useMemo } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { PageHeader } from "@/components/layout/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Edit, ChevronUp, ChevronDown, Search } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "@/components/ui/use-toast";

interface MessageTemplate {
  id: string;
  category: string;
  situation: string;
  message: string;
}

// Sample message templates data
const initialTemplates: MessageTemplate[] = [
  { id: "G1", category: "General", situation: "Urgent EOD Role update", message: "Client - Manager - Role - EOD URGENT (DATE)\n\nNAME/ROLE - Needs <blank> or we will fall behind, can you push forward tonight?" },
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
  const [sortConfig, setSortConfig] = useState<{
    key: keyof MessageTemplate;
    direction: 'ascending' | 'descending';
  } | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Create form
  const form = useForm<MessageTemplate>({
    defaultValues: {
      id: "",
      category: "",
      situation: "",
      message: ""
    }
  });

  // Handle sorting
  const requestSort = (key: keyof MessageTemplate) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Apply sorting and filtering
  const filteredAndSortedTemplates = useMemo(() => {
    let filteredTemplates = templates;
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredTemplates = templates.filter(template => 
        template.id.toLowerCase().includes(query) ||
        template.category.toLowerCase().includes(query) ||
        template.situation.toLowerCase().includes(query) ||
        template.message.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    if (sortConfig !== null) {
      filteredTemplates = [...filteredTemplates].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return filteredTemplates;
  }, [templates, searchQuery, sortConfig]);

  // Copy message to clipboard
  const copyToClipboard = (message: string) => {
    navigator.clipboard.writeText(message);
    toast({
      title: "Copied to clipboard",
      description: "Message has been copied to clipboard",
    });
  };

  // Open edit dialog
  const openEditDialog = (template: MessageTemplate) => {
    setSelectedTemplate(template);
    form.reset(template);
    setIsEditDialogOpen(true);
  };

  // Save edited template
  const saveTemplate = (data: MessageTemplate) => {
    if (selectedTemplate) {
      // Update template in the list
      setTemplates(prev => 
        prev.map(t => t.id === selectedTemplate.id ? { ...data, id: selectedTemplate.id } : t)
      );
      
      toast({
        title: "Template updated",
        description: "Message template has been updated successfully",
      });
      
      setIsEditDialogOpen(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container py-10">
        <PageHeader 
          title="Message Templates" 
          description="Manage and use message templates for communication with candidates" 
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
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px] cursor-pointer" onClick={() => requestSort('id')}>
                  ID
                  {sortConfig?.key === 'id' && (
                    sortConfig.direction === 'ascending' ? <ChevronUp className="ml-1 h-4 w-4 inline" /> : <ChevronDown className="ml-1 h-4 w-4 inline" />
                  )}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => requestSort('category')}>
                  Category
                  {sortConfig?.key === 'category' && (
                    sortConfig.direction === 'ascending' ? <ChevronUp className="ml-1 h-4 w-4 inline" /> : <ChevronDown className="ml-1 h-4 w-4 inline" />
                  )}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => requestSort('situation')}>
                  Situation
                  {sortConfig?.key === 'situation' && (
                    sortConfig.direction === 'ascending' ? <ChevronUp className="ml-1 h-4 w-4 inline" /> : <ChevronDown className="ml-1 h-4 w-4 inline" />
                  )}
                </TableHead>
                <TableHead>Message</TableHead>
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedTemplates.length > 0 ? (
                filteredAndSortedTemplates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell className="font-medium">{template.id}</TableCell>
                    <TableCell>{template.category}</TableCell>
                    <TableCell>{template.situation}</TableCell>
                    <TableCell className="max-w-md">
                      <div className="truncate">{template.message}</div>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => copyToClipboard(template.message)}
                        title="Copy Message"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => openEditDialog(template)}
                        title="Edit Template"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    No message templates found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Edit dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Message Template</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(saveTemplate)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <Input placeholder="Category" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="situation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Situation</FormLabel>
                        <FormControl>
                          <Input placeholder="Situation" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Message content" 
                          className="min-h-[200px] font-mono"
                          {...field} 
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Save Changes</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
