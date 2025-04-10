
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
  cc?: string;
  subject: string;
  body: string;
  candidateName: string;
  jobTitle?: string;
  threadId?: string;
  messageId?: string;
  userId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, cc, subject, body, candidateName, jobTitle, threadId, messageId, userId } = await req.json() as EmailRequest;

    if (!to || !body || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the user's Gmail token
    const { data: tokenData, error: tokenError } = await supabase
      .from('gmail_tokens')
      .select('access_token, expires_at')
      .eq('user_id', userId)
      .single();
    
    if (tokenError || !tokenData) {
      return new Response(
        JSON.stringify({ error: 'Gmail not connected' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (new Date(tokenData.expires_at) <= new Date()) {
      return new Response(
        JSON.stringify({ error: 'Gmail token expired' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const accessToken = tokenData.access_token;
    const emailCC = cc || "recruitment@theitbc.com";
    
    // Generate a unique Message-ID for this email if not replying
    const currentMessageId = `<itbc-${Date.now()}-${Math.random().toString(36).substring(2, 10)}@mail.gmail.com>`;
    
    // Basic email structure
    let emailLines = [
      `To: ${to}`,
      `Cc: ${emailCC}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=utf-8',
      `Message-ID: ${currentMessageId}`,
    ];
    
    // Only add Subject for new emails
    if (!threadId) {
      emailLines.push(`Subject: ${subject}`);
    }
    
    // Add threading headers for replies to ensure proper threading
    if (threadId && messageId) {
      // Format messageId properly (ensure angle brackets)
      const formattedMessageId = messageId.startsWith('<') ? messageId : `<${messageId}>`;
      emailLines.push(`References: ${formattedMessageId}`);
      emailLines.push(`In-Reply-To: ${formattedMessageId}`);
    }
    
    // Separate headers from body
    emailLines.push('', body);
    
    const emailContent = emailLines.join('\r\n');
    const encodedEmail = btoa(emailContent)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    // Create request body, including threadId for replies
    const requestBody = {
      raw: encodedEmail
    };
    
    // Add threadId only for replies
    if (threadId) {
      requestBody.threadId = threadId;
    }
    
    // Send the email via Gmail API
    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      return new Response(
        JSON.stringify({ 
          error: 'Failed to send email through Gmail API',
          details: responseData 
        }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Return both thread ID and message ID from the response
    return new Response(
      JSON.stringify({ 
        success: true,
        threadId: responseData.threadId || threadId,
        messageId: responseData.id
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to send email', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
