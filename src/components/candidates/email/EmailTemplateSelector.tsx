
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
  // Filter templates to only include M1, M2, M3 categories
  const sequenceTemplates = templates.filter(template => 
    ['M1', 'M2', 'M3'].includes(template.category)
  );

  // Sort templates to ensure M1, M2, M3 order
  const sortedTemplates = sequenceTemplates.sort((a, b) => {
    const order = { 'M1': 1, 'M2': 2, 'M3': 3 };
    return order[a.category] - order[b.category];
  });

  return (
    <div className="space-y-4">
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="template">Select Email Template</Label>
        <Select value={selectedTemplate} onValueChange={onSelectTemplate}>
          <SelectTrigger id="template">
            <SelectValue placeholder="Select a template" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="custom">Custom Message</SelectItem>
            {sortedTemplates.map((template) => (
              <SelectItem key={template.id} value={template.id}>
                {template.category} - {template.situation || "Template"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
