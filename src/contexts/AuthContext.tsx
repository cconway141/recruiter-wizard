
import React, { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

// Define a type for the profile
interface Profile {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  display_name?: string | null;
  role?: string | null;
  avatar_url?: string | null;
  google_linked?: boolean;
  email_signature?: string | null;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  signOut: () => Promise<void>;
  loading: boolean;
  isGoogleLinked: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGoogleLinked, setIsGoogleLinked] = useState(false);
  const navigate = useNavigate();

  // Function to fetch profile data
  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    
    return data as Profile;
  };

  useEffect(() => {
    let inactivityTimer: NodeJS.Timeout;

    const resetInactivityTimer = () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        console.log('Session expired due to inactivity');
        signOut();
      }, 5 * 60 * 1000); // 5 minutes
    };

    // Set up event listeners for user activity
    const events = ['mousedown', 'keydown', 'mousemove', 'scroll'];
    events.forEach(event => document.addEventListener(event, resetInactivityTimer));

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (event === 'SIGNED_IN') {
          resetInactivityTimer();
          
          // Check if user is Google-linked and fetch profile
          const checkUserData = async () => {
            if (currentSession?.user) {
              const isGoogle = currentSession.user.app_metadata?.provider === 'google';
              
              if (isGoogle) {
                setIsGoogleLinked(true);
              }
              
              // Fetch profile data
              const profileData = await fetchProfile(currentSession.user.id);
              if (profileData) {
                setProfile(profileData);
                setIsGoogleLinked(profileData.google_linked || isGoogle);
              }
            }
          };
          
          setTimeout(() => {
            checkUserData();
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
          setIsGoogleLinked(false);
          navigate('/auth');
        } else if (event === 'USER_UPDATED') {
          // Refresh profile when user is updated
          if (currentSession?.user) {
            setTimeout(() => {
              fetchProfile(currentSession.user.id).then(profileData => {
                if (profileData) {
                  setProfile(profileData);
                }
              });
            }, 0);
          }
        }
      }
    );

    // Initial session check
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        // Fetch profile data
        fetchProfile(currentSession.user.id).then(profileData => {
          if (profileData) {
            setProfile(profileData);
            // Check if user is Google-linked
            const isGoogle = currentSession.user.app_metadata?.provider === 'google';
            setIsGoogleLinked(profileData.google_linked || isGoogle);
          }
        });
      }
      
      setLoading(false);
      
      if (currentSession) {
        resetInactivityTimer();
      }
    });

    // Cleanup function
    return () => {
      subscription.unsubscribe();
      clearTimeout(inactivityTimer);
      events.forEach(event => document.removeEventListener(event, resetInactivityTimer));
    };
  }, [navigate]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user, profile, signOut, loading, isGoogleLinked }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
