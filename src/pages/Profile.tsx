import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Navbar } from "@/components/layout/Navbar";
import { PageHeader } from "@/components/layout/PageHeader";
import { useAuth } from "@/contexts/AuthContext";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Mail, MailCheck, FileSignature } from "lucide-react";
import { GmailConnectButton } from "@/components/candidates/email/GmailConnectButton";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const profileFormSchema = z.object({
  emailSignature: z.string().optional(),
});

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
  avatar_url?: string;
}

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

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

  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      emailSignature: '',
    },
    values: {
      emailSignature: profile?.email_signature || '',
    }
  });

  const handleUpdateProfile = async (values: z.infer<typeof profileFormSchema>) => {
    if (!user) return;
    
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          email_signature: values.emailSignature || ''
        })
        .eq('id', user.id);

      if (profileError) {
        throw profileError;
      }

      toast({
        title: "Profile Updated",
        description: "Your email signature has been successfully updated.",
      });

      navigate('/');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    }
  };

  const isGoogleLinked = profile?.google_linked || user?.app_metadata?.provider === 'google';
  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || profile?.avatar_url;
  const firstName = user?.user_metadata?.first_name || profile?.first_name || '';
  const lastName = user?.user_metadata?.last_name || profile?.last_name || '';
  const email = user?.email || profile?.email || '';
  const displayName = `${firstName} ${lastName}`.trim() || email?.split('@')[0] || '';
  const initials = displayName
    ? displayName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    : 'U';

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container py-10">
        <PageHeader 
          title="Edit Profile" 
          description="Update your account settings"
        />
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="col-span-full md:col-span-1 lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={avatarUrl} alt={displayName} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                Personal Information
              </CardTitle>
              <CardDescription>Your Google account details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm font-medium mb-1.5">First Name</p>
                      <div className="border rounded-md p-2.5 bg-gray-50 text-gray-600">
                        {firstName}
                      </div>
                      {isGoogleLinked && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Managed by your Google account
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium mb-1.5">Last Name</p>
                      <div className="border rounded-md p-2.5 bg-gray-50 text-gray-600">
                        {lastName}
                      </div>
                      {isGoogleLinked && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Managed by your Google account
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium mb-1.5">Email Address</p>
                    <div className="border rounded-md p-2.5 bg-gray-50 text-gray-600">
                      {email}
                    </div>
                    {isGoogleLinked && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Managed by your Google account
                      </p>
                    )}
                  </div>
                  
                  <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(handleUpdateProfile)} className="space-y-4">
                      <FormField
                        control={profileForm.control}
                        name="emailSignature"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-1.5">
                              <FileSignature className="h-4 w-4" />
                              Email Signature
                            </FormLabel>
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
                        Update Email Signature
                      </Button>
                    </form>
                  </Form>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="col-span-full md:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MailCheck className="h-5 w-5" /> Gmail Integration
                </CardTitle>
                <CardDescription>Connect your Gmail account to send emails</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Connect your Gmail account to send emails directly from the platform.
                </p>
                <GmailConnectButton />
              </CardContent>
            </Card>
            
            {isGoogleLinked && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" /> Google Account
                  </CardTitle>
                  <CardDescription>Your account is linked with Google</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Your account is currently linked with Google. Your profile information will be automatically updated each time you login.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
