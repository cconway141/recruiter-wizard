
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
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the request body
    const { to, subject, body, candidateName } = await req.json() as EmailRequest;

    // Validate request
    if (!to || !subject || !body) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Preparing to send email to ${to} with subject "${subject}"`);

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
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=utf-8',
      '',  // Empty line to separate headers from body
      body
    ];
    
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
      },
    });

    console.log('Email sent successfully:', response.data);

    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Email sent to ${candidateName} at ${to}` 
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
