
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { GmailCard } from "@/components/profile/GmailCard";
import { GoogleAccountCard } from "@/components/profile/GoogleAccountCard";
import { EmailSignatureCard } from "@/components/profile/EmailSignatureCard";
import { ProfileLoading } from "@/components/profile/ProfileLoading";
import { ProfileError } from "@/components/profile/ProfileError";

export interface Profile {
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

interface ProfileContentProps {
  setError: (error: string | null) => void;
}

export const ProfileContent = ({ setError }: ProfileContentProps) => {
  const { user, isGoogleLinked } = useAuth();

  // Get profile data
  const { data: profile, isLoading: profileLoading, error: profileError } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        return data as Profile;
      } catch (err: any) {
        console.error("Error fetching profile:", err);
        setError(err.message || "Failed to load profile");
        return null;
      }
    },
    enabled: !!user?.id
  });

  const isProfileGoogleLinked = profile?.google_linked || isGoogleLinked;

  if (profileLoading && !profile) {
    return <ProfileLoading />;
  }

  if (profileError) {
    return <ProfileError error={profileError.message || "An error occurred while loading your profile"} />;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Email Signature Card */}
      <EmailSignatureCard profile={profile} />
      
      <div className="col-span-full md:col-span-1 space-y-6">
        <GmailCard />
        
        {isProfileGoogleLinked && (
          <GoogleAccountCard />
        )}
      </div>
    </div>
  );
};
