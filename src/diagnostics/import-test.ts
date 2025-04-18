
// This file helps diagnose import resolution issues
export const importDiagnostics = {
  existingImports: [
    'Index',
    'NotFound',
    'Auth',
    'AddJob',
    'EditJob',
    'ViewJob',
    'Settings',
    'MessageTemplates',
    'Profile',
    'TestLogin'
  ],
  missingImports: [
    'Dashboard',
    'Jobs',
    'JobDetails',
    'Candidates',
    'CandidateDetails'
  ]
};

console.log("Import Diagnostics Loaded:", importDiagnostics);
