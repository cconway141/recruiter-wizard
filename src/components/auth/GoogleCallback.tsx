
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Loader2 } from 'lucide-react';

export const GoogleCallback = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLinkingDialog, setShowLinkingDialog] = useState(false);
  const [existingUserEmail, setExistingUserEmail] = useState('');
  const [googleUserData, setGoogleUserData] = useState<any>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // If we have received a session in the URL
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          throw new Error('No session found');
        }

        // Check if the user has an existing email/password account
        const { user } = session;
        
        if (user?.app_metadata?.provider === 'google') {
          // This is a direct Google sign in, check if we need to handle account linking
          const { data: existingUsers, error: existingUserError } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', user.email);

          if (existingUserError) {
            throw existingUserError;
          }

          // Check if any of the existing users don't have google_linked set to true
          const unlinkedUsers = existingUsers?.filter(profile => {
            // Use optional chaining and explicit check for false
            return profile && profile.google_linked === false;
          });

          if (unlinkedUsers && unlinkedUsers.length > 0) {
            // An existing user with the same email exists but isn't linked to Google
            setExistingUserEmail(user.email || '');
            setGoogleUserData(user);
            setShowLinkingDialog(true);
            setLoading(false);
            return;
          }
        }

        // Update user profile with Google details if needed
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
              email_signature: ''
            });

          if (insertError) {
            throw insertError;
          }
        }

        toast({
          title: 'Authentication successful',
          description: 'You are now signed in!'
        });

        navigate('/');
      } catch (err: any) {
        console.error('Error in Google callback:', err);
        setError(err.message || 'Authentication failed');
        setLoading(false);
      }
    };

    handleCallback();
  }, [navigate]);

  const handleAccountLinking = async (confirm: boolean) => {
    if (!confirm || !googleUserData) {
      // User cancelled or no data, just redirect to auth page
      setShowLinkingDialog(false);
      navigate('/auth');
      return;
    }

    try {
      setLoading(true);
      
      // Link the existing account with the Google account
      const { data: existingUsers, error: existingUserError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', existingUserEmail);

      if (existingUserError) {
        throw existingUserError;
      }

      if (existingUsers && existingUsers.length > 0) {
        // Update the profile to mark it as Google linked
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ google_linked: true })
          .eq('email', existingUserEmail);

        if (updateError) {
          throw updateError;
        }

        toast({
          title: 'Accounts linked',
          description: 'Your accounts have been successfully linked. Please use Google to sign in from now on.'
        });
      }

      navigate('/');
    } catch (error: any) {
      console.error('Account linking error:', error);
      toast({
        title: 'Account linking failed',
        description: error.message || 'Failed to link accounts',
        variant: 'destructive'
      });
      navigate('/auth');
    } finally {
      setShowLinkingDialog(false);
      setLoading(false);
    }
  };

  if (loading && !showLinkingDialog) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Processing your login...</p>
        </div>
      </div>
    );
  }

  if (error && !showLinkingDialog) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md p-4">
          <h2 className="text-xl font-bold text-red-600 mb-2">Authentication Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            className="bg-recruiter-secondary text-white px-4 py-2 rounded hover:bg-recruiter-accent"
            onClick={() => navigate('/auth')}
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <AlertDialog open={showLinkingDialog} onOpenChange={setShowLinkingDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Link your accounts?</AlertDialogTitle>
          <AlertDialogDescription>
            We found an existing account with the email {existingUserEmail}. Would you like to link your Google account to this existing account?
            <br /><br />
            Once linked, you'll only be able to log in using Google.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => handleAccountLinking(false)}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => handleAccountLinking(true)}>Link Accounts</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
