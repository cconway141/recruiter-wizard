
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/layout/Navbar";
import { PageHeader } from "@/components/layout/PageHeader";
import { useAuth } from "@/contexts/AuthContext";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { GmailCard } from "@/components/profile/GmailCard";
import { PasswordCard } from "@/components/profile/PasswordCard";
import { GoogleAccountCard } from "@/components/profile/GoogleAccountCard";
import { SecurityCard } from "@/components/profile/SecurityCard";

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  display_name: string;
  created_at: string;
  updated_at: string;
  role: string;
  email_signature?: string;
  google_linked?: boolean;
}

const Profile = () => {
  const { user, isGoogleLinked } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (error) throw error;
      return data as Profile;
    },
    enabled: !!user?.id
  });

  // Force refresh Gmail status on component mount
  useEffect(() => {
    if (user?.id) {
      queryClient.invalidateQueries({ queryKey: ['gmail-connection', user.id] });
    }
  }, [user?.id, queryClient]);

  const handleProfileSuccess = () => {
    navigate('/');
  };

  const isProfileGoogleLinked = profile?.google_linked || isGoogleLinked;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container py-10">
        <PageHeader 
          title="Edit Profile" 
          description="Update your personal information and account settings"
        />
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <ProfileForm 
            user={user} 
            profile={profile} 
            onSuccess={handleProfileSuccess} 
          />
          
          <div className="col-span-full md:col-span-1 space-y-6">
            <GmailCard />
            
            {!isProfileGoogleLinked && (
              <PasswordCard />
            )}
            
            {isProfileGoogleLinked && (
              <GoogleAccountCard />
            )}
            
            <SecurityCard />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
