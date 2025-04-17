
import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { PageHeader } from "@/components/layout/PageHeader";

const Candidates = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container py-10">
        <PageHeader 
          title="Candidates" 
          description="Manage and track candidates for your jobs"
        />
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <p>Candidates listing will appear here</p>
        </div>
      </main>
    </div>
  );
};

export default Candidates;
