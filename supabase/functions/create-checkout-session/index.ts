import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import Stripe from "stripe";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2023-10-16",
});

serve(async (req: Request) => { // Handle POST requests only
  try {
    if (req.method !== "POST") {
      return new Response("Only POST requests allowed", { status: 405 });
    }

    const { amount, stripeAccountId, description } = await req.json(); 

    if (!amount || !stripeAccountId) {
      return new Response(
        JSON.stringify({ error: "Missing amount or stripeAccountId" }),
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.create( // Create a checkout session for PayNow
      {
        payment_method_types: ["paynow"],
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "sgd",
              product_data: {
                name: description || "Tutoring Payment",
              },
              unit_amount: Math.round(amount * 100),
            },
            quantity: 1,
          },
        ],
        success_url: "https://example.com/payment-success",
      cancel_url: "https://example.com/payment-cancel"
      },
      {
        stripeAccount: stripeAccountId,
      }
    );

    return new Response(JSON.stringify({ url: session.url }), { // Return the session URL
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Stripe error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to create checkout session" }),
      { status: 500 }
    );
  }
});
