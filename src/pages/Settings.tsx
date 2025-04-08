
import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { PageHeader } from "@/components/layout/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClientsManager } from "@/components/settings/ClientsManager";
import { FlavorsManager } from "@/components/settings/FlavorsManager";
import { LocalesManager } from "@/components/settings/LocalesManager";
import { StatusesManager } from "@/components/settings/StatusesManager";
import { toast } from "@/components/ui/use-toast";
import { setupAirtable, getAirtableConfig } from "@/utils/airtableUtils";
import { AirtableSetup } from "@/components/settings/AirtableSetup";

const Settings = () => {
  const [isAirtableSetup, setIsAirtableSetup] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [baseId, setBaseId] = useState("");
  const [activeTab, setActiveTab] = useState<string>("airtable");

  // Load saved configuration on component mount
  useEffect(() => {
    const config = getAirtableConfig();
    if (config.apiKey && config.baseId) {
      setApiKey(config.apiKey);
      setBaseId(config.baseId);
      setIsAirtableSetup(true);
    }
  }, []);

  const handleSaveAirtableConfig = () => {
    if (!apiKey || !baseId) {
      toast({
        title: "Missing Information",
        description: "Please provide both API Key and Base ID.",
        variant: "destructive",
      });
      return;
    }

    // Save configuration
    setupAirtable(apiKey, baseId);
    setIsAirtableSetup(true);

    toast({
      title: "Airtable Configuration Saved",
      description: "Your Airtable connection has been configured successfully.",
    });
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container py-10">
        <PageHeader 
          title="Settings" 
          description="Configure your application settings and manage data."
        />

        <Tabs defaultValue="airtable" className="mt-6" onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="airtable">Airtable Integration</TabsTrigger>
            <TabsTrigger value="clients">Clients</TabsTrigger>
            <TabsTrigger value="statuses">Statuses</TabsTrigger>
            <TabsTrigger value="locales">Locales</TabsTrigger>
            <TabsTrigger value="flavors">Job Flavors</TabsTrigger>
          </TabsList>
          
          <TabsContent value="airtable" className="p-4 border rounded-md mt-4">
            <AirtableSetup 
              apiKey={apiKey} 
              baseId={baseId} 
              setApiKey={setApiKey}
              setBaseId={setBaseId}
              handleSave={handleSaveAirtableConfig}
              isConfigured={isAirtableSetup}
            />
          </TabsContent>
          
          <TabsContent value="clients" className="p-4 border rounded-md mt-4">
            <ClientsManager />
          </TabsContent>
          
          <TabsContent value="statuses" className="p-4 border rounded-md mt-4">
            <StatusesManager />
          </TabsContent>
          
          <TabsContent value="locales" className="p-4 border rounded-md mt-4">
            <LocalesManager />
          </TabsContent>
          
          <TabsContent value="flavors" className="p-4 border rounded-md mt-4">
            <FlavorsManager />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Settings;
