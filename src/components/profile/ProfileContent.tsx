
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { GmailCard } from "@/components/profile/GmailCard";
import { GoogleAccountCard } from "@/components/profile/GoogleAccountCard";
import { EmailSignatureCard } from "@/components/profile/EmailSignatureCard";

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
  const [localError, setLocalError] = useState<string | null>(null);

  // Get profile data with optimized settings - but NEVER block rendering on this
  const { data: profile, error: profileError, isLoading } = useQuery({
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
        setLocalError(err.message || "Failed to load profile");
        setError(err.message || "Failed to load profile");
        return null;
      }
    },
    enabled: !!user?.id,
    // Don't refetch on window focus to reduce unnecessary loads
    refetchOnWindowFocus: false,
    // Use a meaningful staleTime to reduce unnecessary refetches
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1, // Only retry once
  });

  // Handle errors but don't block rendering
  if (profileError && !localError) {
    console.error("Profile fetch error:", profileError);
    setLocalError(profileError instanceof Error ? profileError.message : "Failed to load profile");
    setError(profileError instanceof Error ? profileError.message : "Failed to load profile");
  }

  const isProfileGoogleLinked = useMemo(() => 
    profile?.google_linked || isGoogleLinked, 
    [profile?.google_linked, isGoogleLinked]
  );

  // Always render content immediately - even during profile loading
  // This ensures the page doesn't remain blank
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
