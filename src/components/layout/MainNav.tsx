
import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface MainNavProps {
  className?: string;
}

export function MainNav({ className }: MainNavProps) {
  return (
    <nav className={cn("flex items-center space-x-4 lg:space-x-6", className)}>
      <Link
        to="/dashboard"
        className="text-sm font-medium transition-colors hover:text-primary"
      >
        Dashboard
      </Link>
      <Link
        to="/jobs"
        className="text-sm font-medium transition-colors hover:text-primary"
      >
        Jobs
      </Link>
      <Link
        to="/candidates"
        className="text-sm font-medium transition-colors hover:text-primary"
      >
        Candidates
      </Link>
      <Link
        to="/profile"
        className="text-sm font-medium transition-colors hover:text-primary"
      >
        Profile
      </Link>
    </nav>
  );
}
