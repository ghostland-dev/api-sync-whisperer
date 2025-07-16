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

    const { integrationId } = await req.json();
    const startTime = Date.now();

    // Get integration details with connections
    const { data: integration, error: integrationError } = await supabase
      .from('integrations')
      .select(`
        *,
        source_connection:user_connections!source_connection_id (
          *,
          api_providers (*)
        ),
        target_connection:user_connections!target_connection_id (
          *,
          api_providers (*)
        )
      `)
      .eq('id', integrationId)
      .single();

    if (integrationError) throw integrationError;

    let executionResult = { success: false, message: "", data: null };

    try {
      const { source_connection, target_connection } = integration;
      
      // Step 1: Fetch data from source API
      const sourceData = await fetchFromAPI(source_connection);
      
      // Step 2: Transform data (basic example)
      const transformedData = transformData(sourceData, integration.transformation_config);
      
      // Step 3: Send data to target API
      const targetResult = await sendToAPI(target_connection, transformedData);
      
      executionResult = {
        success: true,
        message: "Intégration exécutée avec succès",
        data: { source: sourceData, target: targetResult }
      };

      // Update integration stats
      await supabase
        .from('integrations')
        .update({
          last_run_at: new Date().toISOString(),
          run_count: integration.run_count + 1,
          success_count: integration.success_count + 1
        })
        .eq('id', integrationId);

    } catch (execError: any) {
      executionResult = {
        success: false,
        message: execError.message || "Erreur d'exécution",
        data: null
      };

      // Update integration stats with error
      await supabase
        .from('integrations')
        .update({
          last_run_at: new Date().toISOString(),
          run_count: integration.run_count + 1,
          error_count: integration.error_count + 1
        })
        .eq('id', integrationId);
    }

    const executionTime = Date.now() - startTime;

    // Log the execution
    await supabase
      .from('integration_logs')
      .insert({
        integration_id: integrationId,
        status: executionResult.success ? 'success' : 'error',
        message: executionResult.message,
        data: executionResult.data,
        execution_time_ms: executionTime
      });

    return new Response(JSON.stringify(executionResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    console.error("Error executing integration:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

async function fetchFromAPI(connection: any) {
  const { api_providers: provider, credentials } = connection;
  
  let headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (provider.auth_type === "bearer") {
    headers["Authorization"] = `Bearer ${credentials.api_key}`;
  }

  // Example: Fetch recent data based on provider
  let endpoint = provider.base_url;
  
  switch (provider.name.toLowerCase()) {
    case "calendly":
      endpoint = "https://api.calendly.com/scheduled_events?count=5";
      break;
    case "github":
      endpoint = "https://api.github.com/user/repos?per_page=5";
      break;
    case "slack":
      endpoint = "https://slack.com/api/conversations.list?limit=5";
      break;
    default:
      throw new Error(`Source API ${provider.name} not implemented yet`);
  }

  const response = await fetch(endpoint, { headers });
  
  if (!response.ok) {
    throw new Error(`Source API error: ${response.status}`);
  }

  return await response.json();
}

async function sendToAPI(connection: any, data: any) {
  const { api_providers: provider, credentials } = connection;
  
  let headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (provider.auth_type === "bearer") {
    headers["Authorization"] = `Bearer ${credentials.api_key}`;
  }

  // Example: Send data based on provider
  let endpoint = provider.base_url;
  let payload = data;
  
  switch (provider.name.toLowerCase()) {
    case "notion":
      endpoint = "https://api.notion.com/v1/pages";
      headers["Notion-Version"] = "2022-06-28";
      // Transform to Notion page format
      payload = {
        parent: { database_id: "your-database-id" },
        properties: {
          Name: {
            title: [{ text: { content: data.summary || "API Integration Data" } }]
          }
        }
      };
      break;
    case "slack":
      endpoint = "https://slack.com/api/chat.postMessage";
      payload = {
        channel: "#general",
        text: `Nouvelle donnée reçue: ${JSON.stringify(data)}`
      };
      break;
    default:
      throw new Error(`Target API ${provider.name} not implemented yet`);
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Target API error: ${response.status}`);
  }

  return await response.json();
}

function transformData(sourceData: any, config: any) {
  // Basic data transformation logic
  // In a real implementation, this would be more sophisticated
  return {
    summary: `Données transformées à ${new Date().toISOString()}`,
    originalData: sourceData,
    transformedAt: new Date().toISOString()
  };
}