import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { Loader2, Save, PlusCircle, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Prompt {
  id: number;
  name: string;
  description: string;
  prompt_text: string;
  created_at: string;
  updated_at: string;
}

export function PromptsManager() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [currentPrompt, setCurrentPrompt] = useState<Prompt | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching prompts...');
      const { data, error } = await (supabase
        .from('prompts') as any)
        .select('*')
        .order('id');

      if (error) {
        console.error('Error fetching prompts:', error);
        throw error;
      }
      
      if (data) {
        console.log('Fetched prompts:', data);
        const typedPrompts = data as Prompt[];
        setPrompts(typedPrompts);
        if (typedPrompts.length > 0) {
          setCurrentPrompt(typedPrompts[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching prompts:', error);
      toast({
        title: "Failed to load prompts",
        description: "There was an error loading the AI prompts.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!currentPrompt) return;
    
    setIsSaving(true);
    try {
      const { error } = await (supabase
        .from('prompts') as any)
        .update({
          name: currentPrompt.name,
          description: currentPrompt.description,
          prompt_text: currentPrompt.prompt_text,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentPrompt.id);

      if (error) throw error;
      
      toast({
        title: "Prompt saved",
        description: "The AI prompt was successfully updated.",
      });
      
      fetchPrompts();
    } catch (error) {
      console.error('Error saving prompt:', error);
      toast({
        title: "Failed to save prompt",
        description: "There was an error updating the AI prompt.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePromptChange = (promptId: number) => {
    const selected = prompts.find(p => p.id === promptId);
    if (selected) {
      setCurrentPrompt(selected);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!currentPrompt) return;
    
    setCurrentPrompt({
      ...currentPrompt,
      [e.target.name]: e.target.value
    });
  };

  const getVariableHints = (promptId: number) => {
    switch (promptId) {
      case 1: // Video Questions
      case 2: // Screening Questions
        return [
          { 
            name: "${minSkills}", 
            description: "Minimum skills required for the role, including skill levels and years of experience" 
          }
        ];
      case 3: // Other Information
        return [
          { 
            name: "${jobDescription}", 
            description: "Full job description text used to extract contextual details" 
          }
        ];
      case 4: // Extract Skills
        return [
          { 
            name: "${jobDescription}", 
            description: "Complete job description to extract technical skills" 
          }
        ];
      case 5: // Extract Minimum Skills
        return [
          { 
            name: "${jobDescription}", 
            description: "Full job description to determine minimum required skills" 
          }
        ];
      default:
        return [];
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">AI Prompts</h2>
        <Button 
          onClick={handleSave} 
          disabled={isSaving || !currentPrompt}
          className="flex items-center"
        >
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Changes
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Manage AI Prompts</CardTitle>
          <CardDescription>
            Edit the prompts used for OpenAI API calls when generating content for job postings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {prompts.length === 0 ? (
            <p className="text-center py-8 text-gray-500">No prompts found. Add prompts through the database.</p>
          ) : (
            <div className="space-y-6">
              <Tabs 
                defaultValue={currentPrompt?.id.toString()} 
                onValueChange={(value) => handlePromptChange(parseInt(value))}
              >
                <TabsList className="grid grid-cols-5 mb-6">
                  {prompts.map(prompt => (
                    <TabsTrigger key={prompt.id} value={prompt.id.toString()}>
                      {prompt.name}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {prompts.map(prompt => (
                  <TabsContent key={prompt.id} value={prompt.id.toString()}>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Prompt Name</Label>
                        <Input
                          id="name"
                          name="name"
                          value={currentPrompt?.name || ''}
                          onChange={handleInputChange}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Input
                          id="description"
                          name="description"
                          value={currentPrompt?.description || ''}
                          onChange={handleInputChange}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="prompt_text">Prompt Text</Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <Info className="h-4 w-4 mr-1" />
                                  Available Variables
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="w-96 p-4">
                                <h4 className="font-semibold mb-2">Variables you can use:</h4>
                                <ul className="space-y-2">
                                  {getVariableHints(prompt.id).map((variable, idx) => (
                                    <li key={idx} className="flex flex-col">
                                      <span className="font-mono text-sm text-primary">{variable.name}</span>
                                      <span className="text-xs text-muted-foreground">{variable.description}</span>
                                    </li>
                                  ))}
                                </ul>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <Textarea
                          id="prompt_text"
                          name="prompt_text"
                          value={currentPrompt?.prompt_text || ''}
                          onChange={handleInputChange}
                          className="min-h-[300px] font-mono"
                        />
                      </div>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button 
            onClick={handleSave}
            disabled={isSaving || !currentPrompt}
            className="flex items-center"
          >
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Changes
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
