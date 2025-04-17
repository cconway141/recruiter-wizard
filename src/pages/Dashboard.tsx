
import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { PageHeader } from "@/components/layout/PageHeader";

const Dashboard = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container py-10">
        <PageHeader 
          title="Dashboard" 
          description="Welcome to your application dashboard"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {/* Dashboard content will go here */}
          <div className="p-6 bg-white rounded-lg shadow">
            <h3 className="text-lg font-medium">Quick Stats</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Summary of your recent activity
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
