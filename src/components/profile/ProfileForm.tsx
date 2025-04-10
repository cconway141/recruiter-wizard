
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { User } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";

const profileFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  emailSignature: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ProfileFormProps {
  user: any;
  profile: any;
  onSuccess?: () => void;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({ 
  user, 
  profile,
  onSuccess 
}) => {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: user?.user_metadata?.first_name || '',
      lastName: user?.user_metadata?.last_name || '',
      email: user?.email || '',
      emailSignature: '',
    },
    values: {
      firstName: profile?.first_name || user?.user_metadata?.first_name || '',
      lastName: profile?.last_name || user?.user_metadata?.last_name || '',
      email: user?.email || '',
      emailSignature: profile?.email_signature || '',
    }
  });

  const handleUpdateProfile = async (values: ProfileFormValues) => {
    if (!user) return;
    
    const emailChanged = values.email !== user.email;
    
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          first_name: values.firstName, 
          last_name: values.lastName,
          display_name: `${values.firstName} ${values.lastName}`.trim(),
          email_signature: values.emailSignature || ''
        })
        .eq('id', user.id);

      if (profileError) {
        throw profileError;
      }

      const { error: metadataError } = await supabase.auth.updateUser({
        data: { first_name: values.firstName, last_name: values.lastName }
      });

      if (metadataError) {
        throw metadataError;
      }

      if (emailChanged) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: values.email,
        });

        if (emailError) {
          throw emailError;
        }

        toast({
          title: "Email Update Initiated",
          description: "Please check your new email address for a confirmation link.",
        });
      } else {
        toast({
          title: "Profile Updated",
          description: "Your profile has been successfully updated.",
        });
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="col-span-full md:col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" /> Personal Information
        </CardTitle>
        <CardDescription>Update your personal details</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleUpdateProfile)} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter first name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter last name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter email address" {...field} />
                  </FormControl>
                  <FormDescription>
                    Changing your email will require confirmation via a new email.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
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
              Update Profile
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
