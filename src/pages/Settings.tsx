import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { PageHeader } from "@/components/layout/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClientsManager } from "@/components/settings/ClientsManager";
import { FlavorsManager } from "@/components/settings/FlavorsManager";
import { LocalesManager } from "@/components/settings/LocalesManager";
import { StatusesManager } from "@/components/settings/StatusesManager";
import { MessageTemplatesManager } from "@/components/settings/MessageTemplatesManager";
import { RoleAbbreviationsManager } from "@/components/settings/RoleAbbreviationsManager";
const Settings = () => {
  const [activeTab, setActiveTab] = useState<string>("clients");
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };
  return <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container py-10">
        <PageHeader title="Settings" description="Configure your application settings and manage data." />

        <Tabs defaultValue="clients" className="mt-6" onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="clients">Clients</TabsTrigger>
            <TabsTrigger value="statuses">Statuses</TabsTrigger>
            <TabsTrigger value="locales">Locales</TabsTrigger>
            <TabsTrigger value="flavors">Job Flavors</TabsTrigger>
            <TabsTrigger value="roles">Role Abbreviations</TabsTrigger>
            <TabsTrigger value="messages">Message Templates</TabsTrigger>
          </TabsList>
          
          <TabsContent value="clients" className="p-4 border rounded-md mt-4 bg-white">
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
          
          <TabsContent value="roles" className="p-4 border rounded-md mt-4">
            <RoleAbbreviationsManager />
          </TabsContent>
          
          <TabsContent value="messages" className="p-4 border rounded-md mt-4">
            <MessageTemplatesManager />
          </TabsContent>
        </Tabs>
      </main>
    </div>;
};
export default Settings;