import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const { connectionId } = await req.json();

    // Get connection details
    const { data: connection, error: connectionError } = await supabase
      .from('user_connections')
      .select(`
        *,
        api_providers (*)
      `)
      .eq('id', connectionId)
      .single();

    if (connectionError) throw connectionError;

    const startTime = Date.now();
    let testResult = { success: false, message: "", statusCode: 0 };

    try {
      const { api_providers: provider, credentials } = connection;
      
      // Test the API connection based on provider
      let testUrl = provider.base_url;
      let headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      // Add authentication based on auth type
      if (provider.auth_type === "bearer" || provider.auth_type === "api_key") {
        headers["Authorization"] = provider.auth_type === "bearer" 
          ? `Bearer ${credentials.api_key}`
          : `${credentials.api_key}`;
      }

      // Provider-specific test endpoints
      switch (provider.name.toLowerCase()) {
        case "calendly":
          testUrl = "https://api.calendly.com/users/me";
          break;
        case "notion":
          testUrl = "https://api.notion.com/v1/users/me";
          headers["Notion-Version"] = "2022-06-28";
          break;
        case "slack":
          testUrl = "https://slack.com/api/auth.test";
          break;
        case "github":
          testUrl = "https://api.github.com/user";
          break;
        case "stripe":
          testUrl = "https://api.stripe.com/v1/account";
          break;
        default:
          // Generic test - just try to reach the base URL
          testUrl = provider.base_url;
      }

      const response = await fetch(testUrl, { 
        method: "GET", 
        headers,
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      testResult = {
        success: response.ok,
        message: response.ok ? "Connexion réussie" : `Erreur HTTP ${response.status}`,
        statusCode: response.status
      };

      // Update connection status
      await supabase
        .from('user_connections')
        .update({
          status: response.ok ? 'connected' : 'error',
          last_tested_at: new Date().toISOString(),
          error_message: response.ok ? null : testResult.message
        })
        .eq('id', connectionId);

    } catch (testError: any) {
      testResult = {
        success: false,
        message: testError.message || "Erreur de connexion",
        statusCode: 0
      };

      // Update connection with error
      await supabase
        .from('user_connections')
        .update({
          status: 'error',
          last_tested_at: new Date().toISOString(),
          error_message: testResult.message
        })
        .eq('id', connectionId);
    }

    const executionTime = Date.now() - startTime;

    return new Response(JSON.stringify({
      success: testResult.success,
      message: testResult.message,
      statusCode: testResult.statusCode,
      executionTime
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    console.error("Error testing API connection:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});