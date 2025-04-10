
import React, { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  signOut: () => Promise<void>;
  loading: boolean;
  isGoogleLinked: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGoogleLinked, setIsGoogleLinked] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let inactivityTimer: NodeJS.Timeout;
    let authInitialized = false;

    const resetInactivityTimer = () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        console.log('Session expired due to inactivity');
        signOut();
      }, 1 * 60 * 60 * 1000); // Changed to 1 hour (1 * 60 * 60 * 1000 milliseconds)
    };

    // Set up event listeners for user activity
    const events = ['mousedown', 'keydown', 'mousemove', 'scroll'];
    events.forEach(event => document.addEventListener(event, resetInactivityTimer));

    // Force resolve loading state after a maximum timeout
    // This prevents UI from being blocked indefinitely if auth check fails
    const authTimeoutId = setTimeout(() => {
      if (loading && !authInitialized) {
        console.log("Auth initialization timed out, forcing resolution");
        setLoading(false);
      }
    }, 3000);

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        authInitialized = true;
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setLoading(false);
        
        if (event === 'SIGNED_IN') {
          resetInactivityTimer();
          
          // Check if user is Google-linked
          const checkGoogleLink = async () => {
            if (currentSession?.user) {
              const isGoogle = currentSession.user.app_metadata?.provider === 'google';
              
              if (isGoogle) {
                setIsGoogleLinked(true);
              } else {
                // Check profiles table
                const { data } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('id', currentSession.user.id)
                  .single();
                  
                if (data && 'google_linked' in data) {
                  setIsGoogleLinked(!!data.google_linked);
                }
              }
            }
          };
          
          checkGoogleLink();
        } else if (event === 'SIGNED_OUT') {
          navigate('/auth');
        }
      }
    );

    // Initial session check
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      authInitialized = true;
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        // Check if user is Google-linked
        const isGoogle = currentSession.user.app_metadata?.provider === 'google';
        if (isGoogle) {
          setIsGoogleLinked(true);
        } else {
          // Check profiles table
          supabase
            .from('profiles')
            .select('*')
            .eq('id', currentSession.user.id)
            .single()
            .then(({ data }) => {
              if (data && 'google_linked' in data) {
                setIsGoogleLinked(!!data.google_linked);
              }
            });
        }
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
      clearTimeout(authTimeoutId);
      events.forEach(event => document.removeEventListener(event, resetInactivityTimer));
    };
  }, [navigate]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user, signOut, loading, isGoogleLinked }}>
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
