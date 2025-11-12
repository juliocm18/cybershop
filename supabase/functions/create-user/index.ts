// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {createClient} from "https://esm.sh/@supabase/supabase-js@2";

console.log("Create User Function");

Deno.serve(async (req) => {
  const supabase = createClient(
    "https://mtmikpoblfslzhastcyj.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10bWlrcG9ibGZzbHpoYXN0Y3lqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzMyOTg0NCwiZXhwIjoyMDUyOTA1ODQ0fQ.AfEtUcUDXGJqZX2JDcXhQGdVHdx3tovY1bkVkNICvz4",
    {
      auth: {persistSession: false},
    }
  );

  try {
    const {email, password} = await req.json();

    if (!email || !password) {
      return new Response(JSON.stringify({error: "Email and password are required"}), {
        status: 400,
        headers: {"Content-Type": "application/json"},
      });
    }

    const {data, error} = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (error) {
      return new Response(JSON.stringify({error: error.message}), {
        status: 500,
        headers: {"Content-Type": "application/json"},
      });
    }

    console.log("User created:", data);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {"Content-Type": "application/json"},
    });
  } catch (error) {
    return new Response(JSON.stringify({error: error.message}), {
      status: 500,
      headers: {"Content-Type": "application/json"},
    });
  }
});