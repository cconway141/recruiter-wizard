
import { useState, useMemo } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { PageHeader } from "@/components/layout/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MessageTemplateTable } from "@/components/templates/MessageTemplateTable";
import { Search } from "lucide-react";
import { useMessageTemplates } from "@/hooks/useMessageTemplates";

export default function MessageTemplates() {
  const { templates, loading, updateTemplate } = useMessageTemplates();
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

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 container py-10">
          <PageHeader title="Generic Messages" description="Loading templates..." />
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </main>
      </div>
    );
  }

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
          onUpdateTemplate={updateTemplate} 
        />
      </main>
    </div>
  );
}
