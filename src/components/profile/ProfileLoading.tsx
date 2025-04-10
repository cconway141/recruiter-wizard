
import { Loader2 } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const ProfileLoading = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container py-10">
        <PageHeader 
          title="User Profile" 
          description="Manage your application settings"
        />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="col-span-full md:col-span-1 lg:col-span-2">
            <CardHeader>
              <CardTitle>Loading Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center p-6">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};
