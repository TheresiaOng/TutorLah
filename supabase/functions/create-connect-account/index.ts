import { createClient } from '@supabase/supabase-js';
import { serve } from "https://deno.land/std/http/server.ts";
import Stripe from 'stripe';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2023-10-16",
});

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req: Request) => { // Handle POST requests only
  try {
    const { userId } = await req.json();

    if (!userId) {
      return new Response(JSON.stringify({ error: "Missing userId" }), {
        status: 400,
      });
    }

    // Create Stripe Connect account
    const account = await stripe.accounts.create({
      type: "express",
      country: "SG",
      capabilities: {
        transfers: { requested: true },
        card_payments: { requested: true },
        paynow_payments: { requested: true },
      },
    });

    const { error } = await supabase // Insert or update user record with Stripe account ID
      .from("users")
      .upsert([{ tutorId: userId, stripe_account_id: account.id }]);

    if (error) {
      console.error("Supabase insert error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to save account in Supabase" }),
        { status: 500 }
      );
    }

    const onboarding = await stripe.accountLinks.create({ // Create onboarding link
      account: account.id,
      refresh_url: "https://super-seahorse-cc9608.netlify.app/onboarding-refresh.html",
      return_url: "https://super-seahorse-cc9608.netlify.app/onboarding-complete.html",
      type: "account_onboarding",
    });

    return new Response( // Return onboarding URL
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
