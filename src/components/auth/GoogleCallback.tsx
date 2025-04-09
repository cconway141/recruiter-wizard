
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export const GoogleCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // If we have a hash in the URL, extract it and handle it
        if (window.location.hash && window.location.hash.includes('access_token')) {
          // Let Supabase client handle the hash fragment
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            throw sessionError;
          }
          
          if (!session) {
            throw new Error('No session found from hash params');
          }

          const { user } = session;
          
          // Check or create profile for the Google user
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (profileError && profileError.code !== 'PGRST116') {
            throw profileError;
          }

          if (!profile) {
            // Create a profile if none exists
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: user.id,
                email: user.email,
                first_name: user.user_metadata?.first_name || user.user_metadata?.full_name?.split(' ')?.[0] || '',
                last_name: user.user_metadata?.last_name || user.user_metadata?.full_name?.split(' ')?.[1] || '',
                display_name: user.user_metadata?.full_name || user.email?.split('@')[0],
                google_linked: true,
                role: 'user'
              });

            if (insertError) {
              throw insertError;
            }
          } else {
            // Update existing profile to mark as Google linked
            await supabase
              .from('profiles')
              .update({ google_linked: true })
              .eq('id', user.id);
          }

          toast({
            title: 'Authentication successful',
            description: 'You are now signed in!'
          });

          navigate('/');
          return;
        }

        // Handle standard callback (code exchange flow)
        const { searchParams } = new URL(window.location.href);
        const code = searchParams.get('code');
        const error = searchParams.get('error');
        
        if (error) {
          throw new Error(`Error returned from OAuth provider: ${error}`);
        }
        
        if (!code) {
          throw new Error('No code parameter found in callback URL');
        }

        // Exchange code for session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }
        
        if (!session) {
          throw new Error('No session found');
        }

        const { user } = session;
        
        // Check or create profile for the Google user
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          throw profileError;
        }

        if (!profile) {
          // Create a profile if none exists
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email,
              first_name: user.user_metadata?.first_name || user.user_metadata?.full_name?.split(' ')?.[0] || '',
              last_name: user.user_metadata?.last_name || user.user_metadata?.full_name?.split(' ')?.[1] || '',
              display_name: user.user_metadata?.full_name || user.email?.split('@')[0],
              google_linked: true,
              role: 'user'
            });

          if (insertError) {
            throw insertError;
          }
        } else {
          // Update existing profile to mark as Google linked
          await supabase
            .from('profiles')
            .update({ google_linked: true })
            .eq('id', user.id);
        }

        toast({
          title: 'Authentication successful',
          description: 'You are now signed in!'
        });

        navigate('/');
      } catch (err: any) {
        console.error('Error in Google callback:', err);
        setError(err.message || 'An unexpected error occurred');
        toast({
          title: 'Authentication failed',
          description: err.message || 'An unexpected error occurred',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, [navigate, location]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Processing your login...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="bg-red-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">Authentication Error</h2>
          <p className="text-gray-500 mb-4">{error}</p>
          <button 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            onClick={() => navigate('/auth')}
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return null;
};
