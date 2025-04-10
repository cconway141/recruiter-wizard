
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Add instance-level counters to track concurrent operations
let activeRequests = 0;
const maxConcurrentRequests = 10;
const requestQueue: Array<() => Promise<Response>> = [];

// Add basic request deduplication with a simple tracking mechanism
const recentRequests = new Map<string, number>();
const REQUEST_WINDOW_MS = 10000; // 10 seconds deduplication window

// Add rate limiting to prevent overwhelming Gmail API
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 60; // 60 requests per minute (Gmail API limit)
let requestCount = 0;
let rateLimitWindowStart = Date.now();

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

// Function to reset rate limit window
function checkAndResetRateLimit() {
  const now = Date.now();
  if (now - rateLimitWindowStart > RATE_LIMIT_WINDOW_MS) {
    console.log(`Resetting rate limit window. Previous count: ${requestCount}`);
    requestCount = 0;
    rateLimitWindowStart = now;
    return true;
  }
  return false;
}

// Process a request, with queueing for when we hit concurrency limits
async function processRequest(handler: () => Promise<Response>): Promise<Response> {
  if (activeRequests >= maxConcurrentRequests) {
    console.log(`Max concurrent requests (${maxConcurrentRequests}) reached, queueing request. Queue length: ${requestQueue.length}`);
    
    return new Promise((resolve) => {
      requestQueue.push(async () => {
        const response = await handler();
        resolve(response);
        return response;
      });
    });
  }
  
  activeRequests++;
  try {
    return await handler();
  } finally {
    activeRequests--;
    
    // Process next request from queue if available
    if (requestQueue.length > 0) {
      console.log(`Processing next request from queue. Remaining: ${requestQueue.length - 1}`);
      const nextHandler = requestQueue.shift();
      if (nextHandler) {
        processRequest(nextHandler).catch(err => {
          console.error("Error processing queued request:", err);
        });
      }
    }
  }
}

serve(async (req) => {
  const startTime = Date.now();
  console.log(`Request received: ${req.method} ${new URL(req.url).pathname} at ${new Date().toISOString()}`);
  console.log(`Active requests: ${activeRequests}, Queue length: ${requestQueue.length}`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  // Check if we need to reset rate limit window
  checkAndResetRateLimit();
  
  // Check if we're at the rate limit
  if (requestCount >= RATE_LIMIT_MAX_REQUESTS) {
    console.warn(`Rate limit reached: ${requestCount}/${RATE_LIMIT_MAX_REQUESTS} requests in current window`);
    const retryAfter = Math.ceil((rateLimitWindowStart + RATE_LIMIT_WINDOW_MS - Date.now()) / 1000);
    return new Response(
      JSON.stringify({ 
        error: 'Rate limit exceeded', 
        message: 'Too many requests to Gmail API. Please try again later.',
        retryAfter
      }),
      { 
        status: 429, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Retry-After': `${retryAfter}`
        } 
      }
    );
  }
  
  // Increment request count for rate limiting
  requestCount++;

  return processRequest(async () => {
    try {
      console.log("Parsing request body");
      const requestBody = await req.json();
      
      // Create a request fingerprint for deduplication
      const fingerprint = JSON.stringify({
        to: requestBody.to,
        subject: requestBody.subject?.substring(0, 50),
        userId: requestBody.userId,
        threadId: requestBody.threadId,
        timestamp: Math.floor(Date.now() / REQUEST_WINDOW_MS) // Round to nearest window
      });
      
      // Check for duplicate requests
      if (recentRequests.has(fingerprint)) {
        const requestTime = recentRequests.get(fingerprint);
        if (requestTime && Date.now() - requestTime < REQUEST_WINDOW_MS) {
          console.log("Duplicate request detected, responding with cached success");
          return new Response(
            JSON.stringify({ 
              success: true, 
              deduplicated: true,
              threadId: requestBody.threadId,
              messageId: "deduplicated-request"
            }),
            { 
              status: 200, 
              headers: { 
                ...corsHeaders, 
                'Content-Type': 'application/json' 
              } 
            }
          );
        }
      }
      
      // Track this request
      recentRequests.set(fingerprint, Date.now());
      
      // Clean up old entries periodically
      if (recentRequests.size > 100) {
        const now = Date.now();
        for (const [key, time] of recentRequests.entries()) {
          if (now - time > REQUEST_WINDOW_MS) {
            recentRequests.delete(key);
          }
        }
      }
      
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
      
      // Send the email via Gmail API with retry logic
      console.log("Sending email to Gmail API...");
      let retries = 2;
      let response;
      let responseData;
      
      while (retries >= 0) {
        try {
          response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
          });
          
          console.log(`Gmail API response status: ${response.status} ${response.statusText}`);
          responseData = await response.json();
          
          if (response.ok) {
            break; // Success, exit retry loop
          }
          
          // Handle rate limiting specifically
          if (response.status === 429) {
            const retryAfter = response.headers.get('Retry-After') || '5';
            const retrySeconds = parseInt(retryAfter, 10) || 5;
            console.log(`Rate limited by Gmail API, waiting ${retrySeconds} seconds before retry`);
            await new Promise(resolve => setTimeout(resolve, retrySeconds * 1000));
          } else if (retries > 0) {
            // For other errors, use exponential backoff
            const backoffMs = 1000 * Math.pow(2, 2 - retries);
            console.log(`Retrying after ${backoffMs}ms, attempts left: ${retries}`);
            await new Promise(resolve => setTimeout(resolve, backoffMs));
          } else {
            console.error("Gmail API error after all retries:", responseData);
            break;
          }
        } catch (error) {
          console.error(`Network error during Gmail API call (retry ${2-retries}/2):`, error);
          if (retries <= 0) break;
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        retries--;
      }
      
      if (!response || !response.ok) {
        console.error("Gmail API error:", { status: response?.status, data: responseData });
        return new Response(
          JSON.stringify({ 
            error: 'Failed to send email through Gmail API',
            status: response?.status,
            details: responseData 
          }),
          { 
            status: response?.status || 500, 
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/json' 
            } 
          }
        );
      }

      // Email sent successfully
      const processingTime = Date.now() - startTime;
      console.log(`Email sent successfully in ${processingTime}ms:`, JSON.stringify({
        threadId: responseData.threadId || threadId,
        messageId: responseData.id
      }));
      
      // Return both thread ID and message ID from the response
      return new Response(
        JSON.stringify({ 
          success: true,
          threadId: responseData.threadId || threadId,
          messageId: responseData.id,
          processingTime
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
});
