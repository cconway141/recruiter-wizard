
import { Navbar } from "@/components/layout/Navbar";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ProfileErrorProps {
  error: string;
}

export const ProfileError = ({ error }: ProfileErrorProps) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container py-10">
        <PageHeader 
          title="User Profile" 
          description="Manage your application settings"
        />
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error loading profile</AlertTitle>
          <AlertDescription>
            {error || "An error occurred while loading your profile. Please try again later."}
          </AlertDescription>
        </Alert>
        <Button onClick={() => window.location.reload()}>
          Refresh Page
        </Button>
      </main>
    </div>
  );
};
