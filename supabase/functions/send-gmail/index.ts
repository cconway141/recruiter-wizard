
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

    // Get service account credentials from environment
    const serviceAccountKey = JSON.parse(Deno.env.get("GMAIL_SERVICE_ACCOUNT") || "{}");
    
    // Initialize the Google Auth client with the service account
    const auth = new GoogleAuth({
      credentials: serviceAccountKey,
      scopes: ['https://www.googleapis.com/auth/gmail.send'],
    });

    // Create Gmail client
    const gmail = google.gmail({ version: 'v1', auth });

    // Create the email content
    const emailContent = [
      `From: ${serviceAccountKey.client_email}`,
      `To: ${to}`,
      `Subject: ${subject}`,
      'Content-Type: text/html; charset=utf-8',
      '',
      body
    ].join('\n');

    // Encode the email to base64url format
    const encodedEmail = btoa(emailContent)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

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
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to send email', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
