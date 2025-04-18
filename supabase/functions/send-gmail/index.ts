import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.29.0";

// Environment variables
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// Create a Supabase client with the service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ------- Rate Limiting Logic -------

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10; // Max 10 requests per minute per IP
const ipRequestCounts = new Map<string, {count: number, timestamp: number}>();

// Clean up rate limit entries older than the window
function cleanupRateLimits() {
  const now = Date.now();
  for (const [ip, data] of ipRequestCounts.entries()) {
    if (now - data.timestamp > RATE_LIMIT_WINDOW) {
      ipRequestCounts.delete(ip);
    }
  }
}

// Check if IP is rate limited
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  cleanupRateLimits();
  
  const data = ipRequestCounts.get(ip);
  if (!data) {
    ipRequestCounts.set(ip, { count: 1, timestamp: now });
    return false;
  }
  
  if (now - data.timestamp > RATE_LIMIT_WINDOW) {
    // Reset counter for new window
    ipRequestCounts.set(ip, { count: 1, timestamp: now });
    return false;
  }
  
  // Increment counter
  data.count++;
  ipRequestCounts.set(ip, data);
  
  return data.count > RATE_LIMIT_MAX_REQUESTS;
}

// ------- Request Deduplication Logic -------

// Deduplication to prevent duplicate requests
const recentRequests = new Map<string, {timestamp: number, result: any}>();
const DEDUPLICATION_WINDOW = 10000; // 10 seconds

// Clean up recent requests older than the deduplication window
function cleanupRecentRequests() {
  const now = Date.now();
  for (const [key, data] of recentRequests.entries()) {
    if (now - data.timestamp > DEDUPLICATION_WINDOW) {
      recentRequests.delete(key);
    }
  }
}

// Generate a request hash for deduplication
function generateRequestHash(body: any): string {
  const str = JSON.stringify(body);
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString();
}

// Check if request is a duplicate
function isDuplicateRequest(body: any): { isDuplicate: boolean, cachedResult?: any } {
  cleanupRecentRequests();
  const hash = generateRequestHash(body);
  const cachedRequest = recentRequests.get(hash);
  
  if (cachedRequest) {
    return { isDuplicate: true, cachedResult: cachedRequest.result };
  }
  
  return { isDuplicate: false };
}

// Store a request result for deduplication
function storeRequestResult(body: any, result: any) {
  const hash = generateRequestHash(body);
  recentRequests.set(hash, { timestamp: Date.now(), result });
}

// ------- Gmail API Integration -------

// Function to build and send a Gmail message
async function sendGmailMessage(
  to: string,
  cc: string, 
  subject: string,
  body: string,
  threadId?: string,
  messageId?: string,
  accessToken?: string
) {
  if (!accessToken) {
    return { error: "No access token available" };
  }
  
  try {
    // Enhanced logging with threading details
    console.log("Sending Gmail with threading details:", {
      to,
      cc: cc ? "Set" : "Not set",
      subject: subject ? `"${subject}"` : "Reply to existing thread",
      bodyLength: body?.length || 0,
      isReply: !!threadId,
      threadId: threadId || "New thread",
      messageId: messageId || "None",
      hasThreadingHeaders: !!(messageId && messageId.trim())
    });
    
    // Build email headers with proper threading info
    const headers = buildEmailHeaders(to, cc, subject, messageId);
    
    // Create email payload with raw email
    const email: any = {
      raw: btoa(headers + body)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '')
    };
    
    // Add threadId to group the message in the correct conversation
    if (threadId && threadId.trim()) {
      console.log("Adding threadId to Gmail API request:", threadId);
      email.threadId = threadId.trim();
    }
    
    // Gmail API endpoint
    const url = 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send';
    
    // Make the request to Gmail API
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(email)
    });
    
    if (!response.ok) {
      return handleGmailApiError(response);
    }
    
    const data = await response.json();

    if (!data.id) {
      console.error("Gmail API returned no messageId");
      return { error: "Gmail API response missing messageId", details: data };
    }
    
    console.log("Gmail API response success:", {
      messageId: data.id,
      threadId: data.threadId,
      wasReply: !!threadId,
      hadMessageIdHeader: !!(messageId && messageId.trim())
    });
    
    return {
      success: true,
      messageId: data.id,
      threadId: data.threadId
    };
  } catch (error) {
    console.error('Error sending Gmail message:', error);
    return { error: error.message || "Unknown error in Gmail sending" };
  }
}

// Build email headers including threading headers if applicable
function buildEmailHeaders(to: string, cc: string, subject: string, messageId?: string): string {
  // Start with basic headers
  let headers = `To: ${to}\r\n`;
  if (cc) headers += `Cc: ${cc}\r\n`;
  if (subject) headers += `Subject: ${subject}\r\n`;
  
  // Add threading headers if this is a reply (messageId is provided)
  // These headers are CRITICAL for threading to work properly
  if (messageId && messageId.trim()) {
    console.log("Adding threading headers with messageId:", messageId);
    headers += `In-Reply-To: <${messageId}>\r\n`;
    headers += `References: <${messageId}>\r\n`;
  } else {
    console.log("No messageId provided, creating new thread (no threading headers)");
  }
  
  headers += 'MIME-Version: 1.0\r\n';
  headers += 'Content-Type: text/html; charset=utf-8\r\n\r\n';
  return headers;
}

// Handle Gmail API errors
async function handleGmailApiError(response: Response) {
  const errorText = await response.text();
  console.error('Gmail API error:', errorText);
  
  if (response.status === 401) {
    return { error: "Gmail token expired", details: errorText };
  }
  
  if (response.status === 429) {
    return { error: "Gmail rate limit exceeded", details: errorText };
  }
  
  return { error: `Gmail API error: ${response.status}`, details: errorText };
}

// Get Gmail tokens for a user
async function getGmailTokens(userId: string) {
  const { data: tokenData, error: tokenError } = await supabase
    .from('gmail_tokens')
    .select('access_token, expires_at, refresh_token')
    .eq('user_id', userId)
    .single();
  
  if (tokenError || !tokenData) {
    console.error("Error retrieving Gmail token:", tokenError);
    return { error: 'Gmail not connected' };
  }
  
  // Check if token is expired
  if (new Date(tokenData.expires_at) <= new Date()) {
    console.log("Token expired, refresh needed");
    
    if (!tokenData.refresh_token) {
      return { error: 'No refresh token available. Please reconnect Gmail.' };
    }
    
    return { error: 'Gmail token expired' };
  }
  
  return { tokenData };
}

// Main request handler
serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  // Apply rate limiting
  const clientIp = req.headers.get('x-forwarded-for') || 'unknown';
  if (isRateLimited(clientIp)) {
    console.log(`Rate limit exceeded for IP: ${clientIp}`);
    return new Response(
      JSON.stringify({ error: 'Too many requests', message: 'Rate limit exceeded. Please try again later.' }),
      { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  try {
    // Parse request body
    const body = await req.json();
    const { userId, to, cc, subject, body: emailBody, candidateName, jobTitle, threadId, messageId } = body;
    
    // Enhanced request validation logging
    console.log("Email request received:", {
      to: to || "MISSING",
      hasCC: !!cc,
      hasSubject: !!subject,
      bodyLength: emailBody?.length || 0,
      isReply: !!threadId,
      threadId: threadId || "New thread",
      messageId: messageId || "None",
      candidateName: candidateName || "Not provided"
    });
    
    // Validate required fields
    if (!userId || !to || !emailBody) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields', details: 'userId, to, and body are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Check for duplicate requests to avoid sending the same email twice
    const { isDuplicate, cachedResult } = isDuplicateRequest(body);
    if (isDuplicate && cachedResult) {
      console.log('Duplicate request detected, returning cached result');
      return new Response(
        JSON.stringify(cachedResult),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Get the Gmail tokens for this user
    const { tokenData, error: tokenError } = await getGmailTokens(userId);
    
    if (tokenError) {
      const result = { error: tokenError };
      storeRequestResult(body, result);
      return new Response(
        JSON.stringify(result),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Send the email with threading information
    console.log(`Sending email to ${to}${threadId ? ' (reply using threadId)' : ' (new thread)'}`);
    console.log(`Threading details: threadId=${threadId || 'New'}, messageId=${messageId || 'None'}`);
    
    const sendResult = await sendGmailMessage(
      to,
      cc || '',
      subject || '',
      emailBody,
      threadId,
      messageId,
      tokenData.access_token
    );
    
    if (sendResult.error) {
      const result = { error: sendResult.error, details: sendResult.details };
      storeRequestResult(body, result);
      return new Response(
        JSON.stringify(result),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Send successful response
    const result = {
      success: true,
      message: 'Email sent successfully',
      threadId: sendResult.threadId,
      messageId: sendResult.messageId
    };
    
    storeRequestResult(body, result);
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in send-gmail function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
