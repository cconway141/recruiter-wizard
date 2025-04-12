
import React, { useState } from "react";
import { useFormContext } from "react-hook-form";
import { MessageCard } from "@/components/messages/MessageCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { displayFormValue } from "@/utils/formFieldUtils";

interface MessagePreviewSectionProps {
  messages: {
    m1: string | number | null | undefined;
    m2: string | number | null | undefined;
    m3: string | number | null | undefined;
  };
}

export function MessagePreviewSection({ messages }: MessagePreviewSectionProps) {
  const form = useFormContext();
  const previewName = form.watch("previewName") || "Candidate";
  const [selectedMessage, setSelectedMessage] = useState<string>("m1");
  
  // Define message options
  const messageOptions = [
    { value: "m1", label: "M1 - Initial Outreach" },
    { value: "m2", label: "M2 - Detailed Information" },
    { value: "m3", label: "M3 - Video & Final Questions" }
  ];
  
  // Get current message based on selection and ensure it's a string
  const getCurrentMessage = () => {
    let messageValue: string = "";
    let messageTitle: string = "";
    
    switch (selectedMessage) {
      case "m1":
        messageValue = typeof messages.m1 === 'string' ? messages.m1 : String(messages.m1 || "");
        messageTitle = "M1 - Initial Outreach";
        break;
      case "m2":
        messageValue = typeof messages.m2 === 'string' ? messages.m2 : String(messages.m2 || "");
        messageTitle = "M2 - Detailed Information";
        break;
      case "m3":
        messageValue = typeof messages.m3 === 'string' ? messages.m3 : String(messages.m3 || "");
        messageTitle = "M3 - Video & Final Questions";
        break;
      default:
        messageValue = typeof messages.m1 === 'string' ? messages.m1 : String(messages.m1 || "");
        messageTitle = "M1 - Initial Outreach";
    }
    
    return { value: messageValue, title: messageTitle };
  };
  
  const currentMessage = getCurrentMessage();
  
  return (
    <div className="space-y-4">
      <div className="mb-4">
        <Label htmlFor="message-select" className="mb-2 block">Select Message Template</Label>
        <Select value={selectedMessage} onValueChange={setSelectedMessage}>
          <SelectTrigger id="message-select" className="w-full">
            <SelectValue placeholder="Select a message template" />
          </SelectTrigger>
          <SelectContent>
            {messageOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {currentMessage.value !== undefined && currentMessage.value !== null && (
        <MessageCard
          title={currentMessage.title}
          message={currentMessage.value}
          previewName={previewName}
        />
      )}
    </div>
  );
}
