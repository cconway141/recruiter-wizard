
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/layout/Navbar";
import { PageHeader } from "@/components/layout/PageHeader";
import { useAuth } from "@/contexts/AuthContext";

const Profile = () => {
  const { user } = useAuth();
  const [firstName, setFirstName] = useState(user?.user_metadata?.first_name || '');
  const [lastName, setLastName] = useState(user?.user_metadata?.last_name || '');
  const navigate = useNavigate();

  const handleUpdateProfile = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          first_name: firstName, 
          last_name: lastName,
          display_name: `${firstName} ${lastName}`.trim()
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      const { error: metadataError } = await supabase.auth.updateUser({
        data: { first_name: firstName, last_name: lastName }
      });

      if (metadataError) {
        throw metadataError;
      }

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });

      navigate('/');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container py-10">
        <PageHeader 
          title="Edit Profile" 
          description="Update your personal information"
        />
        
        <div className="max-w-md mx-auto space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">First Name</label>
            <Input 
              value={firstName} 
              onChange={(e) => setFirstName(e.target.value)} 
              placeholder="Enter first name" 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Last Name</label>
            <Input 
              value={lastName} 
              onChange={(e) => setLastName(e.target.value)} 
              placeholder="Enter last name" 
            />
          </div>
          
          <Button onClick={handleUpdateProfile} className="w-full">
            Update Profile
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Profile;
