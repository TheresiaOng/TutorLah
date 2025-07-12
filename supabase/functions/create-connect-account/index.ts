import { createClient } from '@supabase/supabase-js';
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from 'stripe';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2023-10-16",
});

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req: Request) => {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return new Response(JSON.stringify({ error: "Missing userId" }), {
        status: 400,
      });
    }

    // Create Stripe Connect Express account
    const account = await stripe.accounts.create({
      type: "express",
      country: "SG",
      capabilities: {
        transfers: { requested: true },
      },
    });

    // Save Stripe account ID to Supabase users table
    const { error } = await supabase
      .from("users")
      .upsert([{ tutorId: userId, stripe_account_id: account.id }]);

    if (error) {
      console.error("Supabase insert error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to save account in Supabase" }),
        { status: 500 }
      );
    }

    // Create onboarding link
    const onboarding = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: "https://yourdomain.com/onboarding-refresh.html",
      return_url: "https://yourdomain.com/onboarding-complete.html",
      type: "account_onboarding",
    });

    return new Response(
      JSON.stringify({ onboardingUrl: onboarding.url }),
      { status: 200 }
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
});
