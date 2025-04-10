
import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/layout/Navbar";
import { PageHeader } from "@/components/layout/PageHeader";
import { useAuth } from "@/contexts/AuthContext";
import { GmailCard } from "@/components/profile/GmailCard";
import { GoogleAccountCard } from "@/components/profile/GoogleAccountCard";
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
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { User } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const emailSignatureSchema = z.object({
  emailSignature: z.string().optional(),
});

type EmailSignatureFormValues = z.infer<typeof emailSignatureSchema>;

interface Profile {
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

const Profile = () => {
  const { user, isGoogleLinked } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (error) throw error;
      return data as Profile;
    },
    enabled: !!user?.id
  });

  // Force refresh Gmail status on component mount
  useEffect(() => {
    if (user?.id) {
      queryClient.invalidateQueries({ queryKey: ['gmail-connection', user.id] });
    }
  }, [user?.id, queryClient]);

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
    } catch (error) {
      console.error('Error updating signature:', error);
      toast({
        title: "Error",
        description: "Failed to update email signature. Please try again.",
        variant: "destructive"
      });
    }
  };

  const isProfileGoogleLinked = profile?.google_linked || isGoogleLinked;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container py-10">
        <PageHeader 
          title="User Profile" 
          description="Manage your application settings"
        />
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Email Signature Card */}
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
          
          <div className="col-span-full md:col-span-1 space-y-6">
            <GmailCard />
            
            {isProfileGoogleLinked && (
              <GoogleAccountCard />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
