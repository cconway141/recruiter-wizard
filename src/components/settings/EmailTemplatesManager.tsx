
import { useState } from "react";
import { useMessageTemplates } from "@/hooks/useMessageTemplates";
import { MessageTemplateTable } from "@/components/templates/MessageTemplateTable";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MessageTemplate } from "@/types/messageTemplate";
import { toast } from "@/hooks/use-toast";

export function EmailTemplatesManager() {
  const { templates, loading, updateTemplate } = useMessageTemplates();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newTemplate, setNewTemplate] = useState<Partial<MessageTemplate>>({
    id: "",
    category: "",
    situation: "",
    message: ""
  });

  const handleAddTemplate = () => {
    // Basic validation
    if (!newTemplate.id || !newTemplate.category || !newTemplate.situation || !newTemplate.message) {
      toast({
        title: "Error",
        description: "All fields are required",
        variant: "destructive"
      });
      return;
    }

    // Check for duplicate ID
    if (templates.some(t => t.id === newTemplate.id)) {
      toast({
        title: "Error",
        description: "Template ID already exists",
        variant: "destructive"
      });
      return;
    }

    // Create new template and add it to the list
    const template = newTemplate as MessageTemplate;
    updateTemplate(template);
    
    // Close dialog and reset form
    setIsAddDialogOpen(false);
    setNewTemplate({
      id: "",
      category: "",
      situation: "",
      message: ""
    });
  };

  const handleInputChange = (field: keyof MessageTemplate, value: string) => {
    setNewTemplate(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Email Templates</h3>
          <p className="text-sm text-muted-foreground">
            Manage email templates used for candidate outreach and communications.
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Template
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading templates...</span>
        </div>
      ) : (
        <MessageTemplateTable 
          templates={templates} 
          onUpdateTemplate={updateTemplate} 
        />
      )}

      {/* Add Template Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Add Email Template</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-id" className="text-right">
                ID
              </Label>
              <Input
                id="new-id"
                value={newTemplate.id}
                onChange={(e) => handleInputChange('id', e.target.value)}
                className="col-span-3"
                placeholder="E.g., T1, T2, etc."
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-category" className="text-right">
                Category
              </Label>
              <Input
                id="new-category"
                value={newTemplate.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="col-span-3"
                placeholder="E.g., M1, M2, Interview, etc."
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-situation" className="text-right">
                Situation
              </Label>
              <Input
                id="new-situation"
                value={newTemplate.situation}
                onChange={(e) => handleInputChange('situation', e.target.value)}
                className="col-span-3"
                placeholder="E.g., Initial Contact, Follow Up, etc."
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="new-message" className="text-right pt-2">
                Message
              </Label>
              <Textarea
                id="new-message"
                value={newTemplate.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                className="col-span-3 min-h-[200px]"
                placeholder="Your email template content. Use [First Name] to personalize."
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={handleAddTemplate}>
              Add Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
