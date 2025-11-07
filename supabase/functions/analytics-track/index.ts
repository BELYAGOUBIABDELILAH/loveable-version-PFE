import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AnalyticsEvent {
  event_type: string;
  event_data: Record<string, any>;
  user_id?: string;
  session_id: string;
  page_url: string;
  user_agent: string;
  ip_address?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const { event_type, event_data, user_id, session_id, page_url } = await req.json();

    const analyticsEvent: AnalyticsEvent = {
      event_type,
      event_data,
      user_id,
      session_id,
      page_url,
      user_agent: req.headers.get('user-agent') || 'unknown',
      ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
    };

    const { error } = await supabaseClient
      .from('analytics_events')
      .insert(analyticsEvent);

    if (error) {
      console.error('Analytics insert error:', error);
      throw error;
    }

    return new Response(
      JSON.stringify({ success: true }), 
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (e) {
    console.error("Analytics error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), 
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
