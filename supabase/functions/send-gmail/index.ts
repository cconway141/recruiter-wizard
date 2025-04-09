
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Define CORS headers for the function
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  to: string;
  cc?: string;
  subject: string;
  body: string;
  candidateName: string;
  jobTitle?: string;
  threadId?: string;
  userId: string; // Added userId to identify which user's tokens to use
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the request body
    const { to, cc, subject, body, candidateName, jobTitle, threadId, userId } = await req.json() as EmailRequest;

    // Validate request
    if (!to || !body || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields (to, body, or userId)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Always use the consistent subject format for threading
    // This ensures all emails to the same candidate about the same job are in one thread
    const emailSubject = subject || `ITBC ${jobTitle || ''} - ${candidateName}`;

    console.log(`Preparing to send email to ${to} with subject "${emailSubject}"`);
    console.log(`Using thread ID: ${threadId || 'New thread'}`);
    console.log(`CC'ing: ${cc || 'None'}`);
    
    // Get the user's Gmail access token
    const { data: tokenData, error: tokenError } = await supabase
      .from('gmail_tokens')
      .select('access_token, expires_at')
      .eq('user_id', userId)
      .single();
    
    if (tokenError || !tokenData) {
      console.error("Failed to get user's Gmail token:", tokenError);
      return new Response(
        JSON.stringify({ 
          error: 'Gmail not connected', 
          message: 'Please connect your Gmail account before sending emails'
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Check if token is expired
    if (new Date(tokenData.expires_at) <= new Date()) {
      return new Response(
        JSON.stringify({ 
          error: 'Gmail token expired', 
          message: 'Your Gmail token has expired. Please reconnect your account.'
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const accessToken = tokenData.access_token;

    // Create the email content - ensure proper MIME formatting
    const emailLines = [
      `To: ${to}`,
      cc ? `Cc: ${cc}` : '', // Add CC if provided
      `Subject: ${emailSubject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=utf-8',
      '',  // Empty line to separate headers from body
      body
    ].filter(line => line !== ''); // Remove empty lines (in case cc is not provided)
    
    // If we have a thread ID, add the References and In-Reply-To headers
    if (threadId) {
      emailLines.splice(2, 0, `References: <${threadId}>`);
      emailLines.splice(3, 0, `In-Reply-To: <${threadId}>`);
    }
    
    const emailContent = emailLines.join('\r\n');
    console.log("Email content prepared");

    // Encode the email in base64 URL-safe format
    const encodedEmail = btoa(emailContent)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    console.log("Sending email via Gmail API with OAuth token");
    
    // Send the email using the Gmail API with OAuth token
    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        raw: encodedEmail,
        ...(threadId && { threadId }),
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gmail API error:', errorData);
      
      let errorMessage = 'Failed to send email through Gmail API';
      let statusCode = response.status;
      
      // Handle specific Gmail API errors with more user-friendly messages
      if (errorData.error?.code === 401) {
        errorMessage = 'Gmail authentication failed. Please reconnect your account.';
      } else if (errorData.error?.code === 403) {
        errorMessage = 'Gmail access denied. You may need additional permissions.';
      } else if (errorData.error?.message) {
        errorMessage = `Gmail error: ${errorData.error.message}`;
      }
      
      return new Response(
        JSON.stringify({ 
          error: errorMessage, 
          details: errorData 
        }),
        { status: statusCode, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('Email sent successfully:', data);

    // Return success response with thread ID for future reference
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Email sent to ${candidateName} at ${to} with CC to ${cc || 'none'}`,
        threadId: data.threadId || data.id
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
