
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
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, cc, subject, body, candidateName, jobTitle, threadId, messageId, userId } = await req.json() as EmailRequest;

    console.log("\n================================================");
    console.log("EMAIL REQUEST DETAILS:");
    console.log("================================================");
    console.log(`CANDIDATE: ${candidateName}`);
    console.log(`TO: ${to}`);
    console.log(`SUBJECT: "${subject}"`);
    console.log(`JOB TITLE: ${jobTitle || "NOT PROVIDED"}`);
    console.log(`THREAD ID: ${threadId || "NEW THREAD"}`);
    console.log(`REFERENCE MESSAGE ID: ${messageId || "NONE"}`);
    console.log("================================================\n");

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

    // Format subject line for new threads
    // Use the provided subject directly - it should already be properly formatted from useEmailSubject
    let formattedSubject = subject;
    
    // Safety check - if somehow subject is undefined, create a proper one
    if (!formattedSubject && !threadId) {
      formattedSubject = `ITBC ${jobTitle || ""} ${candidateName}`.trim();
      console.log(`Created fallback subject: "${formattedSubject}"`);
    }
    
    console.log(`Using email subject: "${formattedSubject}"`);

    const emailCC = cc || "recruitment@theitbc.com";
    console.log(`CC'ing: ${emailCC}`);

    console.log(`Preparing to send email to ${to} with subject "${formattedSubject}"`);
    console.log(`Using thread ID: ${threadId || 'New thread'}`);
    console.log(`Using message ID for reference: ${messageId || 'None (new conversation)'}`);
    
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

    // Generate a unique Message-ID for this email
    const currentMessageId = `<itbc-${Date.now()}-${Math.random().toString(36).substring(2, 10)}@mail.gmail.com>`;
    
    console.log("\n================================================");
    console.log("EMAIL THREADING PARAMETERS:");
    console.log("================================================");
    console.log(`- Is reply: ${!!threadId}`);
    console.log(`- Thread ID: ${threadId || 'None (new thread)'}`);
    console.log(`- Original message ID: ${messageId || 'None (new thread)'}`);
    console.log(`- New message ID: ${currentMessageId}`);
    console.log("================================================\n");
    
    // Improved email headers with proper threading info
    let emailLines = [
      `To: ${to}`,
      `Cc: ${emailCC}`,
      `Subject: ${formattedSubject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=utf-8',
      `Message-ID: ${currentMessageId}`,
    ];
    
    // Add proper threading headers for replies - this is critical for Gmail threading
    // Ensure messageId has angle brackets as required by RFC 2822
    if (threadId && messageId) {
      console.log("Adding proper threading headers for reply to existing conversation");
      
      // Ensure messageId has angle brackets for RFC 2822 compliance
      const formattedMessageId = messageId.startsWith('<') ? messageId : `<${messageId}>`;
      
      // The References header should contain the message ID we're replying to
      emailLines.push(`References: ${formattedMessageId}`);
      
      // The In-Reply-To header should also contain the message ID we're replying to
      emailLines.push(`In-Reply-To: ${formattedMessageId}`);
      
      // Include thread topic for additional threading support
      emailLines.push(`Thread-Topic: ${formattedSubject}`);
      
      console.log("Added threading headers:");
      console.log(`References: ${formattedMessageId}`);
      console.log(`In-Reply-To: ${formattedMessageId}`);
    }
    
    emailLines.push('', body);
    
    const emailContent = emailLines.join('\r\n');
    console.log("Email content prepared with proper RFC-compliant threading headers");
    console.log("Email headers:", emailLines.slice(0, emailLines.length - 2).join('\r\n'));

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
      console.log(`Adding threadId ${threadId} to API request to ensure proper threading`);
      requestBody.threadId = threadId;
    }
    
    console.log("\n================================================");
    console.log("GMAIL API REQUEST DETAILS:");
    console.log("================================================");
    console.log("Request URL: https://gmail.googleapis.com/gmail/v1/users/me/messages/send");
    console.log("Request Method: POST");
    console.log("Request Body:", JSON.stringify(requestBody, null, 2));
    console.log("================================================\n");
    
    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    const responseData = await response.json();
    
    console.log("\n================================================");
    console.log("GMAIL API RESPONSE:");
    console.log("================================================");
    console.log("Status Code:", response.status);
    console.log("Response Body:", JSON.stringify(responseData, null, 2));
    console.log("================================================\n");
    
    if (!response.ok) {
      console.error('Gmail API error:', responseData);
      
      let errorMessage = 'Failed to send email through Gmail API';
      let statusCode = response.status;
      
      if (responseData.error?.code === 401) {
        errorMessage = 'Gmail authentication failed. Please reconnect your account.';
      } else if (responseData.error?.code === 403) {
        errorMessage = 'Gmail access denied. You may need additional permissions.';
      } else if (responseData.error?.message) {
        errorMessage = `Gmail error: ${responseData.error.message}`;
      }
      
      return new Response(
        JSON.stringify({ 
          error: errorMessage, 
          details: responseData 
        }),
        { status: statusCode, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = responseData;
    console.log('Email sent successfully:', data);
    
    // Extract both thread ID and message ID from the response
    const newThreadId = data.threadId || threadId;
    const newMessageId = data.id; // This is the actual message ID needed for future threading
    
    console.log(`Successfully sent email with thread ID: ${newThreadId}`);
    console.log(`Message ID (for future threading): ${newMessageId}`);
    console.log(`Subject: "${formattedSubject}"`);
    console.log(`Is reply: ${!!threadId}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Email sent to ${candidateName} at ${to} with CC to ${emailCC}`,
        threadId: newThreadId,
        messageId: newMessageId,
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
