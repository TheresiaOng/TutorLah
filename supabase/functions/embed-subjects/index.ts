import { serve } from "https://deno.land/std@0.181.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseKey);

const COHERE_API_KEY = Deno.env.get("COHERE_API_KEY")!;

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Only POST allowed", { status: 405 });
  }

  const { subject } = await req.json();

  try {
    const { data: existing, error: fetchError } = await supabase
      .from("subjects")
      .select("*")
      .eq("name", subject)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      // PGRST116 = no rows found (which is okay)
      throw fetchError;
    }

    if (!existing) {
      const embeddingRes = await fetch("https://api.cohere.ai/v1/embed", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${COHERE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          texts: [subject],
          model: "embed-english-light-v3.0",
          input_type: "search_document",
        }),
      });

      const embeddingJson = await embeddingRes.json();
      console.log("Cohere embedding response:", embeddingJson);

      if (
        !embeddingRes.ok || !embeddingJson.embeddings ||
        !embeddingJson.embeddings[0]
      ) {
        throw new Error(
          `Cohere failed: ${embeddingJson?.message || "unknown error"}`,
        );
      }

      const embedding = embeddingJson.embeddings[0];

      const { error: insertError } = await supabase.from("subjects").insert([
        {
          name: subject,
          embedding,
          tutorcount: 0,
          tuteecount: 0,
          createdat: new Date().toISOString(),
          updatedat: new Date().toISOString(),
        },
      ]);

      if (insertError) throw insertError;
    }

    return new Response(
      JSON.stringify({ message: "Subject upserted successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error upserting subject:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
