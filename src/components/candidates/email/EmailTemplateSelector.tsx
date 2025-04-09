
import React from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Template } from "@/hooks/useMessageTemplates";

interface EmailTemplateSelectorProps {
  selectedTemplate: string;
  onSelectTemplate: (templateId: string) => void;
  templates: Template[];
}

export const EmailTemplateSelector: React.FC<EmailTemplateSelectorProps> = ({
  selectedTemplate,
  onSelectTemplate,
  templates
}) => {
  return (
    <div className="space-y-2">
      <label htmlFor="template-select" className="block text-sm font-medium text-gray-700">
        Email Template
      </label>
      <Select value={selectedTemplate} onValueChange={onSelectTemplate}>
        <SelectTrigger id="template-select" className="w-full">
          <SelectValue placeholder="Select a template" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="custom">Custom Email</SelectItem>
          {templates.map((template) => (
            <SelectItem key={template.id} value={template.id}>
              {template.category} - {template.situation}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
