import { serve } from "https://deno.land/std@0.181.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const COHERE_API_KEY = Deno.env.get("COHERE_API_KEY")!;

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Only POST method allowed", { status: 405 });
  }

  try {
    const { experienceLevel, teachingLevel, educationalLevel, subjects, role } =
      await req.json();

    if (!role || !subjects || !Array.isArray(subjects) || !educationalLevel) {
      return new Response("Missing required fields", { status: 400 });
    }

    if (role === "tutor") {
      if (!experienceLevel || !teachingLevel) {
        return new Response("Missing teaching experience or level for tutor", {
          status: 400,
        });
      }
    }

    // AI Validation Step
    const validationPrompt = `
      You are a strict validator for a tutoring app in Singapore.

      The user entered the following subjects:
      ${subjects.join(", ")}

      Validate if all subjects are legitimate academic subjects suitable for tutoring. Do NOT allow questions, opinions, non-educational topics, or personal names.

      Return ONLY one word:
      - "VALID" — if all subjects are clearly academic and safe.
      - "INVALID" — if any subject is suspicious, unsafe, irrelevant, or inappropriate.
      `;

    const validationRes = await fetch("https://api.cohere.ai/v1/chat", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${COHERE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "command-r-plus",
        message: validationPrompt,
        temperature: 0,
      }),
    });

    const validationJson = await validationRes.json();
    const validationVerdict = validationJson.text?.trim().toUpperCase();

    if (validationVerdict !== "VALID") {
      return new Response(
        JSON.stringify({
          error:
            "One or more of your entered subjects seems inappropriate or unrelated to tutoring. Please revise your input.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    // Fetch subject pricing from Supabase
    const { data: subjectData, error } = await supabase
      .from("subjects")
      .select("name, avgprice")
      .in("name", subjects);

    if (error) throw error;

    const pricingMap: Record<string, number> = {};
    for (const subject of subjectData ?? []) {
      if (subject.avgprice !== null) {
        pricingMap[subject.name] = subject.avgprice;
      }
    }

    const subjectsInApp = subjects.filter((s) => pricingMap[s] !== undefined);

    // Shared pricing string
    const pricingList = subjects
      .map((s) => `${s}: S$${pricingMap[s]}`)
      .join("\n");

    // Build prompt depending on role
    const usedAppPricing = subjects.length == subjectsInApp.length
      ? "All prices shown are based on current data and may be subject to change over time."
      : subjects.length != subjectsInApp.length && subjectsInApp.length > 0
      ? "Some subject prices shown are based on current data and may be subject to change over time."
      : " No pricing data from our app is currently available for these subjects. These prices are based on the AI's analysis of similar tutoring services and the information provided.";

    let prompt = "";

    if (role === "tutor") {
      prompt = `
        You are a tutoring pricing assistant in Singapore.

        A tutor has the following experience and preferences:
         - Education: ${educationalLevel}
        - General Teaching Experience: ${experienceLevel ?? "N/A"}
        - Levels tutor wants to teach: ${teachingLevel?.join(", ") ?? "N/A"}
        - Subjects tutor wants to teach: ${subjects.join(", ")}

        ${
        subjectsInApp.length > 0
          ? `\nHere is the average price data:\n${pricingList}`
          : ""
      }

        Please respond with:
        1. A **short paragraph** explaining a fair overall price recommendation.
        2. A **price breakdown by subject and level** (use markdown bullet points).
        3. Keep your tone friendly and brief, but professional.
        4. DO NOT include general advice or lengthy explanations.
        5. Speak directly to the tutor using “you”. Do **NOT** use third person terms like “this tutor” or “they”.
        6. DO NOT change or add or modify the ## Notice section!

        Respond in this format:
        {Short paragraph here}

        ## Price Breakdown:
        - Subject (Level): S$XX – YY per hour
        - ...

        ## Notice:
        1. This is an AI Suggestion, please use this as a reference and adjust according to your personal context.
        2. ${usedAppPricing}
      `;
    } else if (role === "tutee") {
      prompt = `
        You are helping a student (tutee) in Singapore determine what hourly rate they should expect to offer for tutoring (In a range S$XX - YY per hour).

        The student is looking for tutors for the following subjects and this is their educational level:
        - Subjects: ${subjects.join(", ")}
        - Education: ${educationalLevel}
        
        ${
        subjectsInApp.length > 0
          ? `\nHere is the average price data:\n${pricingList}`
          : ""
      }

        Please respond with:
        1. A **short paragraph** suggesting what a fair rate would be to offer.
        2. A **price breakdown by subject and level** (markdown bullet points).
        3. Keep your tone friendly and brief, but professional.
        4. DO NOT include general advice or lengthy explanations.
        5. Speak directly to the tutor using “you”. Do **NOT** use third person terms like “this tutor” or “they”.
        6. DO NOT change or add or modify the ## Notice section!

        Respond in this format:
        {Short paragraph here}

        ## Price Breakdown:
        - Subject (Level): S$XX – YY per hour
        - ...

        ## Notice:
        1. This is an AI Suggestion, please use this as a reference and adjust according to your personal context.
        2. ${usedAppPricing}
      `;
    } else {
      return new Response("Invalid role", { status: 400 });
    }

    // Call Cohere
    const cohereRes = await fetch("https://api.cohere.ai/v1/chat", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${COHERE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "command-r-plus",
        message: prompt,
        temperature: 0.7,
      }),
    });

    const cohereJson = await cohereRes.json();

    if (!cohereRes.ok) {
      console.error("Cohere error:", cohereJson);
      return new Response(JSON.stringify({ error: "Cohere API failed" }), {
        status: 500,
      });
    }

    const responseText = cohereJson.text || cohereJson.generation;

    return new Response(
      JSON.stringify({
        summary: `AI suggestion for ${subjects.length} subjects`,
        suggestedPerSubject: pricingMap,
        cohereMessage: responseText,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("Function error:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
});
