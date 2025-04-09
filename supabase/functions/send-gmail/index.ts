
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GaxiosPromise } from "npm:gaxios";
import { GoogleAuth } from "npm:google-auth-library";
import { gmail_v1, google } from "npm:googleapis";

// Define CORS headers for the function
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  to: string;
  subject: string;
  body: string;
  candidateName: string;
  jobTitle?: string;
  threadId?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the request body
    const { to, subject, body, candidateName, jobTitle, threadId } = await req.json() as EmailRequest;

    // Validate request
    if (!to || !body) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate the subject for new threads if not provided
    const emailSubject = threadId ? subject : `ITBC ${jobTitle || ''} - ${candidateName}`;

    console.log(`Preparing to send email to ${to} with subject "${emailSubject}"`);
    console.log(`Using thread ID: ${threadId || 'New thread'}`);

    // Get service account credentials from environment
    const serviceAccountKey = JSON.parse(Deno.env.get("GMAIL_SERVICE_ACCOUNT") || "{}");
    
    if (!serviceAccountKey.client_email || !serviceAccountKey.private_key) {
      console.error("Invalid service account credentials");
      return new Response(
        JSON.stringify({ error: 'Invalid service account credentials' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize the Google Auth client with the service account
    const auth = new GoogleAuth({
      credentials: serviceAccountKey,
      scopes: ['https://www.googleapis.com/auth/gmail.send'],
    });

    // Create Gmail client
    const gmail = google.gmail({ version: 'v1', auth });

    // Create the email content - ensure proper MIME formatting
    const emailLines = [
      `From: ${serviceAccountKey.client_email}`,
      `To: ${to}`,
      `Subject: ${emailSubject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=utf-8',
      '',  // Empty line to separate headers from body
      body
    ];
    
    // If we have a thread ID, add the References and In-Reply-To headers
    if (threadId) {
      emailLines.splice(3, 0, `References: <${threadId}>`);
      emailLines.splice(4, 0, `In-Reply-To: <${threadId}>`);
    }
    
    const emailContent = emailLines.join('\r\n');
    console.log("Email content prepared");

    // Encode the email in base64 URL-safe format
    const encodedEmail = btoa(emailContent)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    console.log("Sending email via Gmail API");
    
    // Send the email using the Gmail API
    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedEmail,
        ...(threadId && { threadId }),
      },
    });

    console.log('Email sent successfully:', response.data);

    // Return success response with thread ID for future reference
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Email sent to ${candidateName} at ${to}`,
        threadId: response.data.threadId || response.data.id
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error sending email:', error);
    
    // More detailed error information for debugging
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      name: error.name,
    };
    
    console.error('Error details:', JSON.stringify(errorDetails));
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to send email', 
        details: error.message,
        errorInfo: errorDetails
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
