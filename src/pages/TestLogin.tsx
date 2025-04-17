
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const TestLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleDevLogin = async (email: string) => {
    try {
      // This function is for development testing only
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: "password123", // This is just for development
      });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Dev Login Successful",
        description: `Logged in as ${email}`,
      });
      
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Development Test Login</h1>
        <p className="text-sm text-muted-foreground mb-6 text-center">
          This page is for development purposes only.
        </p>
        
        <div className="space-y-3">
          <Button 
            className="w-full" 
            onClick={() => handleDevLogin("admin@example.com")}
          >
            Login as Admin
          </Button>
          <Button 
            className="w-full" 
            variant="outline"
            onClick={() => handleDevLogin("user@example.com")}
          >
            Login as Regular User
          </Button>
          <Button 
            className="w-full" 
            variant="ghost"
            onClick={() => navigate("/auth")}
          >
            Back to Login
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TestLogin;
