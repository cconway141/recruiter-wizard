
import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SidebarNavProps {
  className?: string;
}

export function SidebarNav({ className }: SidebarNavProps) {
  return (
    <nav className={cn("flex flex-col space-y-1", className)}>
      <Button variant="ghost" asChild className="justify-start">
        <Link to="/dashboard">Dashboard</Link>
      </Button>
      <Button variant="ghost" asChild className="justify-start">
        <Link to="/jobs">Jobs</Link>
      </Button>
      <Button variant="ghost" asChild className="justify-start">
        <Link to="/candidates">Candidates</Link>
      </Button>
      <Button variant="ghost" asChild className="justify-start">
        <Link to="/profile">Profile</Link>
      </Button>
    </nav>
  );
}
