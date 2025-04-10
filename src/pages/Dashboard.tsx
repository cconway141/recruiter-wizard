
import React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export function Dashboard() {
  return (
    <div className="container mx-auto py-6">
      <PageHeader 
        title="Dashboard" 
        description="Welcome to the IT Bootcamp Recruitment Portal. Manage jobs and candidates effectively."
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        <div className="bg-card p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-2">Profile</h3>
          <p className="text-muted-foreground mb-4">Manage your profile and Gmail connection</p>
          <Button asChild>
            <Link to="/profile">Go to Profile</Link>
          </Button>
        </div>
        
        <div className="bg-card p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-2">Email Settings</h3>
          <p className="text-muted-foreground">Configure email integrations and templates</p>
        </div>
        
        <div className="bg-card p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-2">System Status</h3>
          <p className="text-muted-foreground">View current system status and connections</p>
        </div>
      </div>
    </div>
  );
}
