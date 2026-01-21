import { stripe } from "@/lib/stripe/server";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// Use service role for webhook (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature")!;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.metadata?.user_id || session.client_reference_id;

        if (!userId) {
          console.error("No user ID in session");
          break;
        }

        // Create purchase record
        await supabaseAdmin.from("purchases").insert({
          user_id: userId,
          stripe_customer_id: session.customer as string,
          stripe_payment_intent_id: session.payment_intent as string,
          plan_type: "lifetime",
          status: "active",
          amount: session.amount_total,
          currency: session.currency,
        });

        // Grant lifetime access to user
        await supabaseAdmin
          .from("profiles")
          .update({ has_lifetime_access: true })
          .eq("id", userId);

        console.log(`Granted lifetime access to user ${userId}`);
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object;
        const paymentIntentId = charge.payment_intent as string;

        if (paymentIntentId) {
          // Find the purchase and revoke access
          const { data: purchase } = await supabaseAdmin
            .from("purchases")
            .select("user_id")
            .eq("stripe_payment_intent_id", paymentIntentId)
            .single();

          if (purchase) {
            // Update purchase status
            await supabaseAdmin
              .from("purchases")
              .update({ status: "refunded" })
              .eq("stripe_payment_intent_id", paymentIntentId);

            // Revoke lifetime access
            await supabaseAdmin
              .from("profiles")
              .update({ has_lifetime_access: false })
              .eq("id", purchase.user_id);

            console.log(`Revoked lifetime access for user ${purchase.user_id} due to refund`);
          }
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
