
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID") || "";
const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET") || "";

// Use dynamic redirect URI generation with fallback for consistency
const getRedirectUri = (req: Request) => {
  // Extract the host from the request
  const url = new URL(req.url);
  const host = url.hostname;
  
  // If we're in production, use the hardcoded value
  if (host.includes('theitbootcamp.com')) {
    return "https://recruit.theitbootcamp.com/auth/gmail-callback";
  }
  
  // For local development/testing, generate from request origin
  const origin = req.headers.get("origin") || url.origin;
  return `${origin}/auth/gmail-callback`;
};

// Basic validation of required environment variables
if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  console.error("Missing required environment variables: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting setup
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 20; // Max 20 requests per minute per IP
const ipRequestCounts = new Map<string, {count: number, timestamp: number}>();

// Clear rate limit entries older than RATE_LIMIT_WINDOW
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

serve(async (req) => {
  // Handle CORS preflight requests
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
    // Check if required environment variables are set
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      return new Response(
        JSON.stringify({ 
          error: 'Configuration error', 
          message: 'Google OAuth credentials are not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in the Supabase Edge Function secrets.' 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Parse the request for action
    let requestBody;
    let action;
    let userId;
    
    const url = new URL(req.url);
    
    // Extract action from URL query parameters if it's a GET request
    if (req.method === 'GET') {
      action = url.searchParams.get('action');
      userId = url.searchParams.get('userId');
    } else {
      // For non-GET requests, parse the body once
      try {
        requestBody = await req.json();
        action = requestBody?.action;
        userId = requestBody?.userId;
      } catch (error) {
        console.error("Error parsing request body:", error);
        return new Response(
          JSON.stringify({ error: 'Invalid JSON in request body' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    
    if (!action) {
      console.error("No action specified");
      return new Response(
        JSON.stringify({ error: 'Missing action parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Processing action: ${action} for user: ${userId || 'not specified'}`);
    
    // Route for getting the authorization URL for Gmail
    if (action === 'get-auth-url') {
      if (!userId) {
        return new Response(
          JSON.stringify({ error: 'User ID is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Use provided redirect URI or generate from request
      const redirectUri = requestBody?.redirectUri || getRedirectUri(req);
      console.log("Using redirect URI:", redirectUri);
      
      // Generate a state parameter to prevent CSRF attacks
      // This will include the user ID so we can associate the tokens with the correct user
      const state = btoa(JSON.stringify({ userId, timestamp: Date.now(), action: 'gmail' }));
      
      // Build the authorization URL with correct redirect URI
      const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      authUrl.searchParams.append('client_id', GOOGLE_CLIENT_ID);
      authUrl.searchParams.append('redirect_uri', redirectUri);
      authUrl.searchParams.append('response_type', 'code');
      authUrl.searchParams.append('scope', 'https://www.googleapis.com/auth/gmail.send');
      authUrl.searchParams.append('access_type', 'offline');
      authUrl.searchParams.append('prompt', 'consent');
      authUrl.searchParams.append('state', state);
      
      // Enhanced logging for debugging
      console.log(`=== GMAIL AUTH DEBUG INFO ===`);
      console.log(`Client ID: ${GOOGLE_CLIENT_ID.substring(0, 10)}...`);
      console.log(`Redirect URI: ${redirectUri}`);
      console.log(`Full auth URL: ${authUrl.toString()}`);
      console.log(`State parameter: ${state}`);
      console.log(`===========================`);
      
      return new Response(
        JSON.stringify({ 
          url: authUrl.toString(), 
          redirectUri: redirectUri,
          clientId: GOOGLE_CLIENT_ID.substring(0, 10) + '...'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Route for handling the callback and exchanging the code for tokens
    if (action === 'exchange-code') {
      const { code, state } = requestBody || {};
      
      if (!code || !state) {
        return new Response(
          JSON.stringify({ error: 'Code and state are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Decode and validate the state
      let stateData;
      try {
        stateData = JSON.parse(atob(state));
        
        // Check if the state is expired (10 minutes max)
        if (Date.now() - stateData.timestamp > 10 * 60 * 1000) {
          throw new Error('State is expired');
        }
      } catch (error) {
        console.error('Error parsing state:', error);
        return new Response(
          JSON.stringify({ error: 'Invalid state parameter' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const userId = stateData.userId;
      const action = stateData.action || 'gmail'; // Default to gmail if not specified
      
      // Use the same redirect URI logic for consistency
      const redirectUri = getRedirectUri(req);
      
      console.log(`Exchanging code for tokens:`);
      console.log(`- Redirect URI: ${redirectUri}`);
      console.log(`- Code length: ${code.length} characters`);
      console.log(`- State data: ${JSON.stringify(stateData)}`);
      
      // Exchange the code for tokens
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code'
        }).toString()
      });
      
      const tokenData = await tokenResponse.json();
      
      if (tokenData.error) {
        console.error('Token exchange error:', tokenData);
        
        // Enhanced error logging with request details
        console.log('Request details that caused the error:');
        console.log(`- Client ID: ${GOOGLE_CLIENT_ID.substring(0, 10)}...`);
        console.log(`- Redirect URI: ${redirectUri}`);
        console.log(`- Code length: ${code.length} characters`);
        
        return new Response(
          JSON.stringify({ 
            error: 'Failed to exchange code for tokens', 
            details: tokenData,
            redirectUriUsed: redirectUri,
            requestDetails: {
              clientIdPrefix: GOOGLE_CLIENT_ID.substring(0, 10) + '...',
              codeLength: code.length,
              timestamp: new Date().toISOString()
            }
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      console.log("Token exchange successful for user:", userId);
      
      // Store the tokens in Supabase
      if (action === 'gmail') {
        try {
          // First delete any existing tokens to ensure clean state
          console.log("Deleting any existing tokens for user:", userId);
          await supabase
            .from('gmail_tokens')
            .delete()
            .eq('user_id', userId);
            
          // Then insert the new tokens
          console.log("Inserting new tokens for user:", userId);
          
          const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000).toISOString();
          console.log(`Token will expire at: ${expiresAt}`);
          
          const insertData = {
            user_id: userId,
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token,
            expires_at: expiresAt,
            token_type: tokenData.token_type,
            scope: tokenData.scope,
          };
          
          const { error: insertError } = await supabase
            .from('gmail_tokens')
            .insert(insertData);
          
          if (insertError) {
            console.error('Error storing tokens:', insertError);
            throw insertError;
          }
          
          // Verify tokens were stored successfully
          const { data: verifyData, error: verifyError } = await supabase
            .from('gmail_tokens')
            .select('*')
            .eq('user_id', userId)
            .single();
            
          if (verifyError || !verifyData) {
            console.error('Error verifying tokens were stored:', verifyError);
            throw new Error('Failed to verify tokens were stored');
          }
          
          console.log("Tokens stored and verified for user:", userId);
          
          return new Response(
            JSON.stringify({ success: true, message: 'Gmail connected successfully' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } catch (storageError) {
          console.error('Error in token storage process:', storageError);
          return new Response(
            JSON.stringify({ error: 'Failed to store tokens', details: storageError.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
      
      // This could be enhanced for other Google services in the future
      return new Response(
        JSON.stringify({ success: true, message: 'Google service connected successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Route for refreshing an expired access token
    if (action === 'refresh-token') {
      if (!userId) {
        return new Response(
          JSON.stringify({ error: 'User ID is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Get the refresh token for this user
      const { data: tokenData, error: tokenError } = await supabase
        .from('gmail_tokens')
        .select('refresh_token, expires_at')
        .eq('user_id', userId)
        .single();
      
      if (tokenError || !tokenData?.refresh_token) {
        console.error('Error fetching refresh token:', tokenError);
        return new Response(
          JSON.stringify({ error: 'No Gmail connection found for this user' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Check if current token is still valid
      if (new Date(tokenData.expires_at) > new Date()) {
        return new Response(
          JSON.stringify({ success: true, message: 'Token is still valid' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Exchange the refresh token for a new access token
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          refresh_token: tokenData.refresh_token,
          grant_type: 'refresh_token'
        }).toString()
      });
      
      const newTokenData = await tokenResponse.json();
      
      if (newTokenData.error) {
        console.error('Token refresh error:', newTokenData);
        return new Response(
          JSON.stringify({ error: 'Failed to refresh token', details: newTokenData }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Update the token in Supabase
      const { error: updateError } = await supabase
        .from('gmail_tokens')
        .update({
          access_token: newTokenData.access_token,
          expires_at: new Date(Date.now() + newTokenData.expires_in * 1000).toISOString(),
        })
        .eq('user_id', userId);
      
      if (updateError) {
        console.error('Error updating token:', updateError);
        return new Response(
          JSON.stringify({ error: 'Failed to update token', details: updateError }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ success: true, message: 'Token refreshed successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Route for checking if a user has connected Gmail
    if (action === 'check-connection') {
      if (!userId) {
        return new Response(
          JSON.stringify({ error: 'User ID is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      console.log("Checking Gmail connection for user:", userId);
      
      // Check if the user has connected Gmail
      const { data, error } = await supabase
        .from('gmail_tokens')
        .select('expires_at, access_token, refresh_token')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) {
        console.error('Error checking connection:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to check connection', details: error }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const isConnected = !!data && !!data.access_token;
      const isExpired = data ? new Date(data.expires_at) <= new Date() : false;
      const hasRefreshToken = !!data?.refresh_token;
      
      console.log("Gmail connection status for user", userId, ":", {
        connected: isConnected,
        expired: isExpired,
        hasRefreshToken: hasRefreshToken,
        needsRefresh: isConnected && isExpired
      });
      
      if (isConnected) {
        // Additional token details for debugging
        console.log(`Token expires at: ${data.expires_at}`);
        console.log(`Current time: ${new Date().toISOString()}`);
        console.log(`Token is ${isExpired ? 'expired' : 'valid'}`);
        console.log(`Has refresh token: ${hasRefreshToken}`);
      }
      
      return new Response(
        JSON.stringify({ 
          connected: isConnected,
          expired: isExpired,
          hasRefreshToken: hasRefreshToken,
          needsRefresh: isConnected && isExpired
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Route for revoking tokens
    if (action === 'revoke-token') {
      if (!userId) {
        return new Response(
          JSON.stringify({ error: 'User ID is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Get the token for this user
      const { data: tokenData, error: tokenError } = await supabase
        .from('gmail_tokens')
        .select('access_token')
        .eq('user_id', userId)
        .single();
      
      if (tokenError || !tokenData) {
        console.error('Error fetching token:', tokenError);
        return new Response(
          JSON.stringify({ error: 'No Gmail connection found for this user' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Revoke the token
      try {
        const revokeResponse = await fetch(`https://oauth2.googleapis.com/revoke?token=${tokenData.access_token}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        
        if (!revokeResponse.ok) {
          console.error('Token revocation error:', await revokeResponse.text());
        }
      } catch (error) {
        console.error('Error revoking token:', error);
        // Continue anyway to delete the local token
      }
      
      // Delete the token from the database
      const { error: deleteError } = await supabase
        .from('gmail_tokens')
        .delete()
        .eq('user_id', userId);
        
      if (deleteError) {
        console.error('Error deleting token:', deleteError);
        return new Response(
          JSON.stringify({ error: 'Failed to delete token', details: deleteError }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ success: true, message: 'Token revoked and deleted successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in google-auth function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message, stack: error.stack }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
