
import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { PageHeader } from "@/components/layout/PageHeader";
import { MessageTemplateTable } from "@/components/templates/MessageTemplateTable";
import { useMessageTemplates } from "@/hooks/useMessageTemplates";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";

const MessageTemplates = () => {
  const { templates, loading, updateTemplate } = useMessageTemplates();
  const [searchTerm, setSearchTerm] = useState("");

  // Filter templates based on search term
  const filteredTemplates = templates.filter(template => 
    template.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.situation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container py-10">
        <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
          <PageHeader 
            title="Message Templates" 
            description="View, edit, and copy standardized messages for recruitment communications."
          />
          
          <div className="flex gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Link to="/">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading templates...</div>
        ) : (
          <MessageTemplateTable 
            templates={filteredTemplates} 
            onUpdateTemplate={updateTemplate} 
          />
        )}
      </main>
    </div>
  );
};

export default MessageTemplates;
