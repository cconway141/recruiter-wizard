
import React from "react";
import { Mail } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";

export const GoogleAccountCard: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" /> Google Account
        </CardTitle>
        <CardDescription>Your account is linked with Google</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Your account is currently linked with Google. You can use your Google account to sign in.
        </p>
      </CardContent>
    </Card>
  );
};
