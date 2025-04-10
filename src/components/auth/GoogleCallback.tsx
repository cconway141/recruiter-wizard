
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export const GoogleCallback = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
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
              first_name: user.user_metadata?.full_name?.split(' ')?.[0] || '',
              last_name: user.user_metadata?.full_name?.split(' ')?.[1] || '',
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
        toast({
          title: 'Authentication failed',
          description: err.message || 'An unexpected error occurred',
          variant: 'destructive'
        });
        navigate('/auth');
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, [navigate]);

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

  return null;
};
