
import { useState } from "react";
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

  // Get profile data with optimized settings - but NEVER block rendering on this
  const { data: profile, error: profileError } = useQuery({
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
    enabled: !!user?.id,
    // Don't refetch on window focus to reduce unnecessary loads
    refetchOnWindowFocus: false,
    // Use a meaningful staleTime to reduce unnecessary refetches
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1, // Only retry once
  });

  // Handle errors but don't block rendering
  if (profileError) {
    console.error("Profile fetch error:", profileError);
    // We don't return or block rendering here - just log the error
  }

  const isProfileGoogleLinked = profile?.google_linked || isGoogleLinked;

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
