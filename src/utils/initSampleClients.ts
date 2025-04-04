
import { supabase } from "@/integrations/supabase/client";
import { clientDatabase } from "./clientData";
import { toast } from "@/components/ui/use-toast";

// Function to seed the clients table with sample data from clientData.ts
export async function seedSampleClients() {
  try {
    console.log("Initializing sample clients...");
    
    // First check if we have any clients already
    const { data: existingClients, error: checkError } = await supabase
      .from("clients")
      .select("count");
      
    if (checkError) {
      console.error("Error checking existing clients:", checkError);
      throw checkError;
    }
    
    // If we already have clients, don't add samples
    if (existingClients && existingClients.length > 0 && existingClients[0].count > 0) {
      console.log(`${existingClients[0].count} clients already exist, skipping sample data creation`);
      return;
    }
    
    // Add each client from our sample data
    console.log(`Adding ${clientDatabase.length} sample clients...`);
    
    for (const client of clientDatabase) {
      const { error } = await supabase
        .from("clients")
        .insert(client);
        
      if (error) {
        console.error(`Error adding sample client ${client.name}:`, error);
        // Continue with other clients even if one fails
      } else {
        console.log(`Added sample client: ${client.name}`);
      }
    }
    
    toast({
      title: "Success",
      description: `Added ${clientDatabase.length} sample clients`,
    });
    
    console.log("Sample clients initialized successfully");
    return true;
  } catch (error) {
    console.error("Error initializing sample clients:", error);
    toast({
      title: "Error",
      description: "Failed to initialize sample clients",
      variant: "destructive",
    });
    return false;
  }
}
