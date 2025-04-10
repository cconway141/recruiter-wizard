
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
  userId: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, cc, subject, body, candidateName, jobTitle, threadId, userId } = await req.json() as EmailRequest;

    if (!to || !body || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields (to, body, or userId)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Email body length: ${body?.length || 0}`);
    if (!body || body.trim() === '') {
      return new Response(
        JSON.stringify({ error: 'Email body is empty', details: 'The email content cannot be empty' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate jobTitle exists for new threads
    if (!threadId && !jobTitle) {
      console.warn("Creating new email thread without job title");
    }

    // Format subject line
    let formattedSubject;
    if (threadId) {
      // For replies, use the original subject
      formattedSubject = subject;
      console.log("Using existing subject for reply:", formattedSubject);
    } else {
      // For new emails, format correctly with job title
      if (jobTitle && jobTitle.trim() !== '') {
        formattedSubject = `ITBC ${jobTitle} - ${candidateName}`.trim();
      } else {
        console.warn("Missing job title for new email. Using fallback format.");
        formattedSubject = `ITBC ${candidateName}`.trim();
      }
      console.log("Created new subject for email:", formattedSubject);
    }
    
    console.log(`Email subject: "${formattedSubject}"`);

    const emailCC = cc || "recruitment@theitbc.com";
    console.log(`CC'ing: ${emailCC}`);

    console.log(`Preparing to send email to ${to} with subject "${formattedSubject}"`);
    console.log(`Using thread ID: ${threadId || 'New thread'}`);
    
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

    // Improved email headers with proper threading info
    let emailLines = [
      `To: ${to}`,
      `Cc: ${emailCC}`,
      `Subject: ${formattedSubject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=utf-8',
    ];
    
    // Improved threading headers for replies
    if (threadId) {
      console.log("Adding threading headers for thread ID:", threadId);
      emailLines.push(`References: <${threadId}@mail.gmail.com>`);
      emailLines.push(`In-Reply-To: <${threadId}@mail.gmail.com>`);
      emailLines.push(`Thread-Topic: ${formattedSubject}`);
      // Add Message-ID header to help with threading
      const messageId = `<reply-${Date.now()}-${threadId}@mail.gmail.com>`;
      emailLines.push(`Message-ID: ${messageId}`);
    }
    
    emailLines.push('', body);
    
    const emailContent = emailLines.join('\r\n');
    console.log("Email content prepared with proper threading headers");
    console.log("Email content first 100 chars:", emailContent.substring(0, 100));

    const encodedEmail = btoa(emailContent)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    console.log("Sending email via Gmail API with OAuth token");
    
    // Enhanced threading with Gmail API
    const requestBody: any = {
      raw: encodedEmail
    };
    
    if (threadId) {
      console.log(`Adding threadId ${threadId} to API request`);
      requestBody.threadId = threadId;
    }
    
    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gmail API error:', errorData);
      
      let errorMessage = 'Failed to send email through Gmail API';
      let statusCode = response.status;
      
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
    
    const newThreadId = data.threadId || data.id;

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Email sent to ${candidateName} at ${to} with CC to ${emailCC}`,
        threadId: newThreadId,
        subject: formattedSubject
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error sending email:', error);
    
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
