
import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [authResolved, setAuthResolved] = useState(false);
  
  useEffect(() => {
    // If auth state is no longer loading, mark as resolved
    if (!loading) {
      // Set auth as resolved immediately when loading is false
      setAuthResolved(true);
    } else {
      // Set a maximum wait time for auth check (2 seconds)
      // This prevents indefinite loading state if auth check stalls
      const timeoutId = setTimeout(() => {
        console.log("Auth check timeout reached, forcing resolution");
        setAuthResolved(true);
      }, 2000); // Reduced from 3000ms to 2000ms for faster fallback
      
      return () => clearTimeout(timeoutId);
    }
  }, [loading]);

  // If auth is still loading but within acceptable time window, show minimal loading indicator
  // This will only show briefly during initial auth check
  if (loading && !authResolved) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  // Once auth is resolved or timed out, either redirect or show content
  if (!user) {
    console.log("User not authenticated, redirecting to /auth");
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // User is authenticated, render the protected content
  console.log("User authenticated, rendering protected content");
  return <>{children}</>;
};
