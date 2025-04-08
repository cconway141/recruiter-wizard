
import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { PageHeader } from "@/components/layout/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClientsManager } from "@/components/settings/ClientsManager";
import { FlavorsManager } from "@/components/settings/FlavorsManager";
import { LocalesManager } from "@/components/settings/LocalesManager";
import { StatusesManager } from "@/components/settings/StatusesManager";

const Settings = () => {
  const [activeTab, setActiveTab] = useState<string>("clients");

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

        <Tabs defaultValue="clients" className="mt-6" onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="clients">Clients</TabsTrigger>
            <TabsTrigger value="statuses">Statuses</TabsTrigger>
            <TabsTrigger value="locales">Locales</TabsTrigger>
            <TabsTrigger value="flavors">Job Flavors</TabsTrigger>
          </TabsList>
          
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
