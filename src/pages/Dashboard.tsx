
import React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';

export function Dashboard() {
  return (
    <div className="container mx-auto py-6">
      <PageHeader 
        title="Dashboard" 
        description="Welcome to the IT Bootcamp Recruitment Portal. Manage jobs and candidates effectively."
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        <div className="bg-card p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-2">Jobs</h3>
          <p className="text-muted-foreground">Manage your recruitment jobs</p>
        </div>
        
        <div className="bg-card p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-2">Candidates</h3>
          <p className="text-muted-foreground">Track candidates and applications</p>
        </div>
        
        <div className="bg-card p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-2">Messages</h3>
          <p className="text-muted-foreground">Manage communication with candidates</p>
        </div>
      </div>
    </div>
  );
}
