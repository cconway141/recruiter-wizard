
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface MessageTemplate {
  id: number;
  m1_template: string;
  m2_template: string;
  m3_template: string;
}

export function MessageTemplatesManager() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [templates, setTemplates] = useState({
    m1_template: "",
    m2_template: "",
    m3_template: ""
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('message_templates')
        .select('*')
        .eq('id', 1)
        .maybeSingle();
      
      if (error) throw error;
      
      if (data) {
        setTemplates({
          m1_template: data.m1_template || "",
          m2_template: data.m2_template || "",
          m3_template: data.m3_template || ""
        });
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
      toast({
        title: "Error",
        description: "Failed to load message templates.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveTemplates = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('message_templates')
        .update({
          m1_template: templates.m1_template,
          m2_template: templates.m2_template,
          m3_template: templates.m3_template
        })
        .eq('id', 1);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Message templates updated successfully.",
      });
    } catch (error) {
      console.error("Error saving templates:", error);
      toast({
        title: "Error",
        description: "Failed to save message templates.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: keyof typeof templates, value: string) => {
    setTemplates(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading templates...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Message Templates</h3>
          <p className="text-sm text-muted-foreground">
            Customize the default message templates used for candidate outreach.
          </p>
        </div>
        <Button 
          onClick={saveTemplates}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Templates
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>M1 - Initial Outreach</CardTitle>
            <CardDescription>
              The first message sent to candidates to gauge their interest.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="m1-template">Template</Label>
              <Textarea
                id="m1-template"
                rows={8}
                value={templates.m1_template}
                onChange={(e) => handleChange('m1_template', e.target.value)}
                placeholder="Hi [First Name]! I'm from The ITBC..."
                className="font-mono"
              />
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">
                Available variables: [First Name], [Title], [Company Description]
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>M2 - Detailed Information</CardTitle>
            <CardDescription>
              The second message with more details about the job.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="m2-template">Template</Label>
              <Textarea
                id="m2-template"
                rows={10}
                value={templates.m2_template}
                onChange={(e) => handleChange('m2_template', e.target.value)}
                placeholder="Great! Here is some more information..."
                className="font-mono"
              />
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">
                Available variables: [Title], [Pay Details], [Work Details], [Skills Sought]
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>M3 - Video & Final Questions</CardTitle>
            <CardDescription>
              The final message requesting a video and additional information.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="m3-template">Template</Label>
              <Textarea
                id="m3-template"
                rows={10}
                value={templates.m3_template}
                onChange={(e) => handleChange('m3_template', e.target.value)}
                placeholder="Awesome! To expedite things as I think you are a strong fit..."
                className="font-mono"
              />
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">
                Available variables: [Video Questions]
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
