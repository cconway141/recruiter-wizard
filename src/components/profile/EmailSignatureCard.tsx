
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Profile } from "./ProfileContent";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

const emailSignatureSchema = z.object({
  emailSignature: z.string().optional(),
});

type EmailSignatureFormValues = z.infer<typeof emailSignatureSchema>;

interface EmailSignatureCardProps {
  profile: Profile | null;
}

export const EmailSignatureCard = ({ profile }: EmailSignatureCardProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Initialize form with profile data
  const form = useForm<EmailSignatureFormValues>({
    resolver: zodResolver(emailSignatureSchema),
    defaultValues: {
      emailSignature: '',
    },
    values: {
      emailSignature: profile?.email_signature || '',
    }
  });

  const handleUpdateSignature = async (values: EmailSignatureFormValues) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          email_signature: values.emailSignature || ''
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Email Signature Updated",
        description: "Your email signature has been successfully updated.",
      });
      
      // Refresh profile data
      queryClient.invalidateQueries({ queryKey: ['profile', user.id] });
    } catch (error: any) {
      console.error('Error updating signature:', error);
      toast({
        title: "Error",
        description: "Failed to update email signature. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="col-span-full md:col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" /> Email Signature
        </CardTitle>
        <CardDescription>Customize your email signature</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleUpdateSignature)} className="space-y-4">
            <FormField
              control={form.control}
              name="emailSignature"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Signature</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Your email signature" 
                      className="min-h-[100px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    This signature will be added to all emails you send through the platform.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full md:w-auto">
              Update Signature
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
