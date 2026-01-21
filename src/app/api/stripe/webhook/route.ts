import Stripe from "stripe";
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
        const pricingMode = session.metadata?.pricing_mode || "lifetime";

        if (!userId) {
          console.error("No user ID in session");
          break;
        }

        await supabaseAdmin.from("purchases").insert({
          user_id: userId,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string | null,
          plan_type: pricingMode,
          status: "active",
          amount: session.amount_total,
          currency: session.currency,
        });

        // Optionally make user an admin after purchase
        // await supabaseAdmin.from("profiles").update({ is_admin: true }).eq("id", userId);

        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object;
        
        await supabaseAdmin
          .from("purchases")
          .update({
            status: subscription.status === "active" ? "active" : "inactive",
          })
          .eq("stripe_subscription_id", subscription.id);

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;

        await supabaseAdmin
          .from("purchases")
          .update({ status: "canceled" })
          .eq("stripe_subscription_id", subscription.id);

        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice & { subscription?: string | Stripe.Subscription | null };
        const subscriptionId = invoice.subscription;

        if (subscriptionId) {
          await supabaseAdmin
            .from("purchases")
            .update({ status: "past_due" })
            .eq("stripe_subscription_id", typeof subscriptionId === "string" ? subscriptionId : subscriptionId.id);
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
