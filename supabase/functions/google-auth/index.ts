
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID") || "";
const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET") || "";

// Use dynamic redirect URI generation with fallback for consistency
const getRedirectUri = (req: Request, providedUri?: string) => {
  // Use provided URI if available (safest option)
  if (providedUri) {
    console.log("Using provided redirect URI:", providedUri);
    return providedUri;
  }
  
  // Extract the host from the request
  const url = new URL(req.url);
  const host = url.hostname;
  
  // Get the origin
  const origin = req.headers.get("origin") || url.origin;
  console.log("Request origin detected:", origin);
  
  // If we're in production, use the hardcoded value
  if (host.includes('theitbootcamp.com')) {
    const prodUri = "https://recruit.theitbootcamp.com/auth/gmail-callback";
    console.log("Using production redirect URI:", prodUri);
    return prodUri;
  }
  
  // For local development/testing, generate from request origin
  const generatedUri = `${origin}/auth/gmail-callback`;
  console.log("Using generated redirect URI:", generatedUri);
  return generatedUri;
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

// Enhanced error handling helper
function createErrorResponse(message: string, status = 400, details: any = null) {
  return new Response(
    JSON.stringify({ 
      error: message, 
      timestamp: new Date().toISOString(),
      details: details
    }),
    { 
      status, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
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
    return createErrorResponse('Too many requests. Please try again later.', 429);
  }
  
  try {
    // Check if required environment variables are set
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      return createErrorResponse(
        'Google OAuth credentials are not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in the Supabase Edge Function secrets.', 
        500
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
        return createErrorResponse('Invalid JSON in request body', 400);
      }
    }
    
    if (!action) {
      console.error("No action specified");
      return createErrorResponse('Missing action parameter', 400);
    }
    
    console.log(`Processing action: ${action} for user: ${userId || 'not specified'}`);
    
    // Route for getting the authorization URL for Gmail
    if (action === 'get-auth-url') {
      if (!userId) {
        return createErrorResponse('User ID is required', 400);
      }
      
      // Use provided redirect URI or generate from request
      const redirectUri = requestBody?.redirectUri || getRedirectUri(req);
      console.log("Using redirect URI:", redirectUri);
      
      // Generate a state parameter to prevent CSRF attacks
      // This will include the user ID so we can associate the tokens with the correct user
      const state = btoa(JSON.stringify({ 
        userId, 
        timestamp: Date.now(), 
        action: 'gmail',
        // Add a random component for additional security
        nonce: Math.random().toString(36).substring(2, 15)
      }));
      
      // Build the authorization URL with correct redirect URI
      const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      authUrl.searchParams.append('client_id', GOOGLE_CLIENT_ID);
      authUrl.searchParams.append('redirect_uri', redirectUri);
      authUrl.searchParams.append('response_type', 'code');
      authUrl.searchParams.append('scope', 'https://www.googleapis.com/auth/gmail.send');
      authUrl.searchParams.append('access_type', 'offline');
      authUrl.searchParams.append('prompt', 'consent'); // Always ask for consent to ensure we get refresh token
      authUrl.searchParams.append('state', state);
      
      // Enhanced logging for debugging
      console.log(`=== GMAIL AUTH DEBUG INFO ===`);
      console.log(`Client ID: ${GOOGLE_CLIENT_ID.substring(0, 10)}...`);
      console.log(`Redirect URI: ${redirectUri}`);
      console.log(`State parameter includes userId: ${userId}`);
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
        return createErrorResponse('Code and state are required', 400);
      }
      
      // Decode and validate the state
      let stateData;
      try {
        stateData = JSON.parse(atob(state));
        
        // Check if the state is expired (10 minutes max)
        if (Date.now() - stateData.timestamp > 10 * 60 * 1000) {
          throw new Error('State is expired');
        }
        
        // Validate required fields
        if (!stateData.userId || !stateData.timestamp) {
          throw new Error('Invalid state structure');
        }
      } catch (error) {
        console.error('Error parsing state:', error);
        return createErrorResponse('Invalid state parameter', 400);
      }
      
      userId = stateData.userId;
      
      // Use the same redirect URI logic for consistency
      const redirectUri = getRedirectUri(req, requestBody?.redirectUri);
      
      console.log(`Exchanging code for tokens:`);
      console.log(`- Redirect URI: ${redirectUri}`);
      console.log(`- Code length: ${code.length} characters`);
      console.log(`- State data: ${JSON.stringify({...stateData, nonce: '***'})}`);
      
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
        
        return createErrorResponse('Failed to exchange code for tokens', 400, {
          details: tokenData,
          redirectUriUsed: redirectUri,
          requestDetails: {
            clientIdPrefix: GOOGLE_CLIENT_ID.substring(0, 10) + '...',
            codeLength: code.length,
            timestamp: new Date().toISOString()
          }
        });
      }
      
      console.log("Token exchange successful for user:", userId);
      
      if (!tokenData.refresh_token) {
        console.warn("No refresh token received! This might cause issues with token renewal.");
      }
      
      // Store the tokens in Supabase
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
          .select('id, created_at')
          .eq('user_id', userId)
          .single();
          
        if (verifyError || !verifyData) {
          console.error('Error verifying tokens were stored:', verifyError);
          throw new Error('Failed to verify tokens were stored');
        }
        
        console.log("Tokens stored and verified for user:", userId);
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Gmail connected successfully',
            tokenId: verifyData.id
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (storageError) {
        console.error('Error in token storage process:', storageError);
        return createErrorResponse('Failed to store tokens', 500, storageError);
      }
    }
    
    // Route for refreshing an expired access token
    if (action === 'refresh-token') {
      if (!userId) {
        return createErrorResponse('User ID is required', 400);
      }
      
      // Get the refresh token for this user
      const { data: tokenData, error: tokenError } = await supabase
        .from('gmail_tokens')
        .select('refresh_token, expires_at')
        .eq('user_id', userId)
        .single();
      
      if (tokenError || !tokenData?.refresh_token) {
        console.error('Error fetching refresh token:', tokenError);
        return createErrorResponse('No Gmail connection found for this user', 404);
      }
      
      // Check if current token is still valid
      if (new Date(tokenData.expires_at) > new Date()) {
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Token is still valid',
            connected: true,
            expired: false
          }),
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
        
        // Special handling for invalid_grant errors, which likely mean the refresh token is invalid
        if (newTokenData.error === 'invalid_grant') {
          console.error('Refresh token is invalid or has been revoked');
          
          // Delete the invalid token
          await supabase
            .from('gmail_tokens')
            .delete()
            .eq('user_id', userId);
            
          return createErrorResponse(
            'Gmail authorization has expired. Please reconnect your account.',
            401, 
            { error: 'invalid_refresh_token' }
          );
        }
        
        return createErrorResponse('Failed to refresh token', 400, newTokenData);
      }
      
      // Update the token in Supabase
      const { error: updateError } = await supabase
        .from('gmail_tokens')
        .update({
          access_token: newTokenData.access_token,
          expires_at: new Date(Date.now() + newTokenData.expires_in * 1000).toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
      
      if (updateError) {
        console.error('Error updating token:', updateError);
        return createErrorResponse('Failed to update token in database', 500, updateError);
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Token refreshed successfully',
          connected: true,
          expired: false
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Route for checking if a user has connected Gmail
    if (action === 'check-connection') {
      if (!userId) {
        return createErrorResponse('User ID is required', 400);
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
        return createErrorResponse('Failed to check connection', 500, error);
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
      
      // If token is expired but has refresh token, automatically refresh it
      if (isConnected && isExpired && hasRefreshToken) {
        console.log("Token is expired, attempting to refresh automatically");
        
        try {
          // Exchange the refresh token for a new access token
          const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              client_id: GOOGLE_CLIENT_ID,
              client_secret: GOOGLE_CLIENT_SECRET,
              refresh_token: data.refresh_token,
              grant_type: 'refresh_token'
            }).toString()
          });
          
          const newTokenData = await tokenResponse.json();
          
          if (newTokenData.error) {
            console.error('Auto-refresh error:', newTokenData);
            
            // Special handling for invalid_grant errors
            if (newTokenData.error === 'invalid_grant') {
              console.error('Refresh token is invalid or has been revoked');
              
              // Delete the invalid token
              await supabase
                .from('gmail_tokens')
                .delete()
                .eq('user_id', userId);
                
              return new Response(
                JSON.stringify({ 
                  connected: false,
                  expired: true,
                  hasRefreshToken: false,
                  refreshError: 'token_revoked'
                }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              );
            }
            
            // Return the connection state with refresh error
            return new Response(
              JSON.stringify({ 
                connected: isConnected,
                expired: isExpired,
                hasRefreshToken: hasRefreshToken,
                needsRefresh: true,
                refreshError: newTokenData.error
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          
          // Update the token in Supabase
          const { error: updateError } = await supabase
            .from('gmail_tokens')
            .update({
              access_token: newTokenData.access_token,
              expires_at: new Date(Date.now() + newTokenData.expires_in * 1000).toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('user_id', userId);
          
          if (updateError) {
            console.error('Error updating token during auto-refresh:', updateError);
            
            // Return the error but with the connection status
            return new Response(
              JSON.stringify({ 
                connected: isConnected,
                expired: isExpired,
                hasRefreshToken: hasRefreshToken,
                needsRefresh: true,
                updateError: updateError.message
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          
          console.log("Token automatically refreshed for user:", userId);
          
          // Return updated connection status
          return new Response(
            JSON.stringify({ 
              connected: true,
              expired: false,
              hasRefreshToken: true,
              autoRefreshed: true
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } catch (refreshError) {
          console.error("Error in auto-refresh process:", refreshError);
          
          // Return original connection status with refresh error
          return new Response(
            JSON.stringify({ 
              connected: isConnected,
              expired: isExpired,
              hasRefreshToken: hasRefreshToken,
              needsRefresh: true,
              refreshError: refreshError instanceof Error ? refreshError.message : 'Unknown refresh error'
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
      
      // Standard response for non-expired tokens
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
        return createErrorResponse('User ID is required', 400);
      }
      
      // Get the token for this user
      const { data: tokenData, error: tokenError } = await supabase
        .from('gmail_tokens')
        .select('access_token')
        .eq('user_id', userId)
        .single();
      
      if (tokenError || !tokenData) {
        console.error('Error fetching token:', tokenError);
        return createErrorResponse('No Gmail connection found for this user', 404);
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
        return createErrorResponse('Failed to delete token from database', 500, deleteError);
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Token revoked and deleted successfully' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    return createErrorResponse('Invalid action', 400);
  } catch (error) {
    console.error('Error in google-auth function:', error);
    return createErrorResponse(
      'Internal server error', 
      500, 
      { 
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      }
    );
  }
});
