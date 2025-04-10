
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface UseGmailDisconnectProps {
  onConnectionChange?: (connected: boolean) => void;
}

export const useGmailDisconnect = ({ onConnectionChange }: UseGmailDisconnectProps = {}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const queryKey = user?.id ? ['gmail-connection', user.id] : ['gmail-connection'];
  
  const disconnectGmail = async () => {
    if (!user) return;
    
    try {
      // First revoke the token through the Google API
      const { error: revokeError } = await supabase.functions.invoke('google-auth', {
        body: {
          action: 'revoke-token',
          userId: user.id
        }
      });
      
      if (revokeError) {
        console.error("Error revoking Gmail token:", revokeError);
      }
      
      // Then delete the token from our database
      const { error: deleteError } = await supabase
        .from('gmail_tokens')
        .delete()
        .eq('user_id', user.id);
      
      if (deleteError) {
        console.error("Error deleting Gmail token:", deleteError);
        toast({
          title: "Error",
          description: "Failed to completely disconnect Gmail. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Gmail Disconnected",
          description: "Your Gmail account has been disconnected.",
        });
        
        // Update state
        if (onConnectionChange) onConnectionChange(false);
        
        // Invalidate the query cache
        queryClient.invalidateQueries({ queryKey });
      }
    } catch (err) {
      console.error("Error in disconnectGmail:", err);
      toast({
        title: "Error",
        description: "Failed to disconnect Gmail. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  return {
    disconnectGmail
  };
};
