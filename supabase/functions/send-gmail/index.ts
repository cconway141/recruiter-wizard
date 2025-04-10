
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  to: string;
  cc?: string[];
  subject: string;
  body: string;
  candidateName: string;
  jobTitle?: string;
  threadId?: string;
  messageId?: string;
  userId: string;
}

serve(async (req) => {
  console.log(`Request received: ${req.method} ${new URL(req.url).pathname}`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Parsing request body");
    const requestBody = await req.json();
    console.log("Request body received:", JSON.stringify(requestBody));
    
    const { 
      to, 
      cc = ['recruitment@theitbc.com'], // Default CC if none provided
      subject, 
      body, 
      candidateName, 
      jobTitle, 
      threadId, 
      messageId, 
      userId 
    } = requestBody as EmailRequest;

    console.log(`Processing email to: ${to}, cc: ${JSON.stringify(cc)}, subject: ${subject?.substring(0, 30)}...`);
    console.log(`Additional info: candidateName: ${candidateName}, threadId: ${threadId || 'new email'}`);

    // Validate required fields
    if (!to || !body || !userId) {
      console.error("Validation error: Missing required fields", { to: !!to, body: !!body, userId: !!userId });
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    // Get the user's Gmail token
    console.log(`Fetching Gmail token for user: ${userId}`);
    const { data: tokenData, error: tokenError } = await supabase
      .from('gmail_tokens')
      .select('access_token, expires_at')
      .eq('user_id', userId)
      .single();
    
    if (tokenError) {
      console.error("Failed to fetch Gmail token:", tokenError);
      return new Response(
        JSON.stringify({ error: 'Gmail not connected', details: tokenError }),
        { 
          status: 401, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }
    
    if (!tokenData) {
      console.error("No Gmail token found for user", userId);
      return new Response(
        JSON.stringify({ error: 'Gmail not connected - no token found' }),
        { 
          status: 401, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }
    
    // Check if token is expired
    const tokenExpiresAt = new Date(tokenData.expires_at);
    const now = new Date();
    console.log(`Token expires at: ${tokenExpiresAt.toISOString()}, current time: ${now.toISOString()}`);
    
    if (tokenExpiresAt <= now) {
      console.error("Gmail token expired", { expiresAt: tokenExpiresAt, now });
      return new Response(
        JSON.stringify({ error: 'Gmail token expired', expiresAt: tokenExpiresAt, now }),
        { 
          status: 401, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }
    
    const accessToken = tokenData.access_token;
    console.log("Access token retrieved successfully");
    
    // Generate a unique Message-ID for this email
    const currentMessageId = `<itbc-${Date.now()}-${Math.random().toString(36).substring(2, 10)}@mail.gmail.com>`;
    console.log(`Generated message ID: ${currentMessageId}`);
    
    // Prepare CC recipients - handle both array and string input for backward compatibility
    let ccRecipients: string[] = [];
    if (typeof cc === 'string') {
      ccRecipients = [cc];
    } else if (Array.isArray(cc)) {
      ccRecipients = cc;
    }
    
    // Basic email structure
    let emailLines = [
      `To: ${to}`,
    ];
    
    // Add CC line only if we have recipients
    if (ccRecipients.length > 0) {
      emailLines.push(`Cc: ${ccRecipients.join(', ')}`);
    }
    
    // Add other headers
    emailLines = [
      ...emailLines,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=utf-8',
      `Message-ID: ${currentMessageId}`,
    ];
    
    // Only add Subject for new emails - format is "ITBC {JobTitle} {CandidateName}"
    if (!threadId) {
      // Format subject with fallback if jobTitle is empty
      const formattedJobTitle = jobTitle?.trim() || "General Position";
      const formattedSubject = subject || `ITBC ${formattedJobTitle} ${candidateName}`;
      emailLines.push(`Subject: ${formattedSubject}`);
      console.log(`Email is a new thread with subject: ${formattedSubject}`);
    } else {
      console.log(`Email is a reply to thread: ${threadId}`);
    }
    
    // Add threading headers for replies
    if (threadId && messageId) {
      // Format messageId properly (ensure angle brackets)
      const formattedMessageId = messageId.startsWith('<') ? messageId : `<${messageId}>`;
      emailLines.push(`References: ${formattedMessageId}`);
      emailLines.push(`In-Reply-To: ${formattedMessageId}`);
      console.log(`Added threading info: References and In-Reply-To: ${formattedMessageId}`);
    }
    
    // Separate headers from body
    emailLines.push('', body);
    
    const emailContent = emailLines.join('\r\n');
    console.log("Email content prepared with length:", emailContent.length);
    
    const encodedEmail = btoa(emailContent)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    console.log("Email encoded successfully");

    // Create request body, including threadId for replies
    const requestBody: { raw: string; threadId?: string } = {
      raw: encodedEmail
    };
    
    // Add threadId only for replies
    if (threadId) {
      requestBody.threadId = threadId;
      console.log(`Adding threadId to request: ${threadId}`);
    }
    
    // Send the email via Gmail API
    console.log("Sending email to Gmail API...");
    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log(`Gmail API response status: ${response.status} ${response.statusText}`);
    const responseData = await response.json();
    console.log("Gmail API response data:", JSON.stringify(responseData));
    
    if (!response.ok) {
      console.error("Gmail API error:", { status: response.status, data: responseData });
      return new Response(
        JSON.stringify({ 
          error: 'Failed to send email through Gmail API',
          status: response.status,
          details: responseData 
        }),
        { 
          status: response.status, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    // Email sent successfully
    console.log("Email sent successfully:", JSON.stringify({
      threadId: responseData.threadId || threadId,
      messageId: responseData.id
    }));
    
    // Return both thread ID and message ID from the response
    return new Response(
      JSON.stringify({ 
        success: true,
        threadId: responseData.threadId || threadId,
        messageId: responseData.id
      }),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    // More detailed error logging
    console.error('Error in email sending function:', error);
    console.error('Error details:', error.stack || 'No stack trace available');
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to send email', 
        details: error.message || 'Unknown error',
        stack: error.stack ? error.stack.split('\n')[0] : null
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
