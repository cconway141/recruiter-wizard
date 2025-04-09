
import React from 'react';
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

export interface EmailTemplateSelectorProps {
  templates: any[];
  selectedTemplate: string;
  onSelectTemplate: (value: string) => void;
}

export const EmailTemplateSelector: React.FC<EmailTemplateSelectorProps> = ({ 
  templates, 
  selectedTemplate,
  onSelectTemplate
}) => {
  return (
    <div className="space-y-4">
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="template">Select Template</Label>
        <Select value={selectedTemplate} onValueChange={onSelectTemplate}>
          <SelectTrigger>
            <SelectValue placeholder="Select a template" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="custom">Custom Message</SelectItem>
            {templates.map((template) => (
              <SelectItem key={template.id} value={template.id}>
                {template.name || `Template ${template.id}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
