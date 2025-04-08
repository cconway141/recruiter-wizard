
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UseFormReturn } from "react-hook-form";
import { MessagePreviewSection } from "../MessagePreviewSection";
import { Loader2 } from "lucide-react";

interface MessageTabsProps {
  form: UseFormReturn<any>;
  messages: {
    m1: string;
    m2: string;
    m3: string;
  };
  isLoading?: boolean;
}

export function MessageTabs({ form, messages, isLoading = false }: MessageTabsProps) {
  const [activeTab, setActiveTab] = useState("m1");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Message Templates</CardTitle>
        <CardDescription>
          These messages are automatically generated based on the job details. You can edit them if needed.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Generating messages...</span>
          </div>
        ) : (
          <Tabs defaultValue="m1" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="m1">Initial Contact</TabsTrigger>
              <TabsTrigger value="m2">Job Details</TabsTrigger>
              <TabsTrigger value="m3">Video Instructions</TabsTrigger>
            </TabsList>
            <TabsContent value="m1">
              <MessagePreviewSection
                messageKey="m1"
                title="Initial Contact Message"
                description="First message sent to candidates introducing the company and position."
                message={messages.m1}
                form={form}
              />
            </TabsContent>
            <TabsContent value="m2">
              <MessagePreviewSection
                messageKey="m2"
                title="Job Details Message"
                description="Follow-up message with detailed job information and requirements."
                message={messages.m2}
                form={form}
              />
            </TabsContent>
            <TabsContent value="m3">
              <MessagePreviewSection
                messageKey="m3"
                title="Video Instructions Message"
                description="Instructions for candidates on how to complete the video portion of the application."
                message={messages.m3}
                form={form}
              />
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
