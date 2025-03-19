
// Client data interface
export interface ClientData {
  name: string;
  manager: string;
  abbreviation: string;
  description: string;
}

// Client database
export const clientDatabase: ClientData[] = [
  { 
    name: "Abercrombie", 
    manager: "Michel Santos", 
    abbreviation: "ANF", 
    description: "a global apparel and accessories retailer with 40,000+ employees and $4B+ annual revenue."
  },
  { 
    name: "Hamaspik", 
    manager: "Jacob S", 
    abbreviation: "HSPK", 
    description: "a healthcare organization specializing in patient advocacy and federally funded health plans in New York."
  },
  { 
    name: "The IT Bootcamp", 
    manager: "Chris C", 
    abbreviation: "ITBC", 
    description: "my internal IT staffing firm and IT Bootcamp with a growing US client base."
  },
  { 
    name: "Intake Rocket", 
    manager: "Lior", 
    abbreviation: "ROCK", 
    description: "a legal tech company, focusing on streamlining client intake and call center operations for law firms."
  },
  { 
    name: "DSW", 
    manager: "David D", 
    abbreviation: "DSW", 
    description: "a global fashion retailer of footwear with >15,000 employees and >$3 Billion in annual revenue."
  },
  { 
    name: "HealthITTek", 
    manager: "Yoemy", 
    abbreviation: "HITK", 
    description: "a healthcare data & claims company that services the largest healthcare companies in the US."
  },
  { 
    name: "Carney", 
    manager: "Michel", 
    abbreviation: "CARN", 
    description: "a US company specializing in building and maintaining WordPress and Shopify websites for clients."
  },
  { 
    name: "Fifth Third", 
    manager: "Drew Gilhooly", 
    abbreviation: "AGP", 
    description: "a leading U.S. bank, ranked among the top 15, that's headquartered in Cincinnati, Ohio."
  },
  { 
    name: "Macys", 
    manager: "Michel S", 
    abbreviation: "MACY", 
    description: "a leading global retailer of apparel and accessories with >80,000 employees and >$5 Billion in annual revenue."
  },
  { 
    name: "Redirect Health", 
    manager: "Brady", 
    abbreviation: "RDH", 
    description: "a healthcare tech company providing healthcare plans customized to meet needs and budgets of their customers."
  },
  { 
    name: "Automation System", 
    manager: "Dawn", 
    abbreviation: "AUTO", 
    description: ""
  },
  { 
    name: "TukaTek", 
    manager: "Sanjay", 
    abbreviation: "TUKA", 
    description: "a startup technology company in the United States with a highly qualified CIO who has multiple clients he is servicing and submitting project proposals to."
  },
  { 
    name: "GroupOS", 
    manager: "Ian S", 
    abbreviation: "GrOS", 
    description: "a startup providing an all-in-one platform for event-based businesses to manage memberships, sell tickets, and drive engagement through tools like chat, content sharing, and data tracking."
  },
  { 
    name: "Tedo", 
    manager: "Tal Joy", 
    abbreviation: "TEDO", 
    description: "a social commerce app connecting crafters, DIYers, and buyers in the arts and crafts community."
  },
  { 
    name: "Muscle Intelligence", 
    manager: "Ben Pakulski", 
    abbreviation: "MUSC", 
    description: "a men's fitness coaching service providing personalized training and support to achieve fitness goals."
  },
  { 
    name: "Falcon Labs", 
    manager: "Gil Shoham", 
    abbreviation: "FALC", 
    description: "a startup building a flexible IoT platform with a gamut of impact features that are customized and configured to redefine operations and decision intelligence."
  },
  { 
    name: "ViziSmart", 
    manager: "Bianca P.", 
    abbreviation: "VIZI", 
    description: "a real estate startup creating a web & mobile solution for landlords, property managers and vendors."
  },
];

// Helper function to get client data by name
export function getClientByName(name: string): ClientData | undefined {
  return clientDatabase.find(client => client.name === name);
}

// Helper function to get all client names for dropdown
export function getClientNames(): string[] {
  return clientDatabase.map(client => client.name);
}
