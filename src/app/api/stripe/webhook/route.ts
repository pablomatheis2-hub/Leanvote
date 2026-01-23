import { stripe } from "@/lib/stripe/server";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

// Use service role for webhook (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;

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
      // Handle one-time payment (lifetime access)
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id || session.client_reference_id;
        const type = session.metadata?.type;

        if (!userId) {
          console.error("No user ID in session");
          break;
        }

        // Only process lifetime payments here
        // Subscriptions are handled by subscription events
        if (type === "lifetime" && session.mode === "payment") {
          // Create purchase record
          await supabaseAdmin.from("purchases").insert({
            user_id: userId,
            stripe_customer_id: session.customer as string,
            stripe_payment_intent_id: session.payment_intent as string,
            plan_type: "lifetime",
            status: "active",
            amount: session.amount_total,
            currency: session.currency,
            project_count: 1,
          });

          // Grant lifetime access to user
          await supabaseAdmin
            .from("profiles")
            .update({ 
              has_lifetime_access: true,
              stripe_customer_id: session.customer as string,
            })
            .eq("id", userId);

          console.log(`Granted lifetime access to user ${userId}`);
        }
        break;
      }

      // Handle subscription created
      case "customer.subscription.created": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.user_id;
        const projectCount = parseInt(subscription.metadata?.project_count || "1", 10);

        if (!userId) {
          // Try to find user by customer ID
          const { data: profile } = await supabaseAdmin
            .from("profiles")
            .select("id")
            .eq("stripe_customer_id", subscription.customer as string)
            .single();

          if (!profile) {
            console.error("No user found for subscription");
            break;
          }

          await updateSubscriptionStatus(profile.id, subscription, projectCount);
        } else {
          await updateSubscriptionStatus(userId, subscription, projectCount);
        }

        console.log(`Subscription created for user`);
        break;
      }

      // Handle subscription updated
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Find user by customer ID or metadata
        const userId = subscription.metadata?.user_id;
        const projectCount = parseInt(subscription.metadata?.project_count || "1", 10);

        if (userId) {
          await updateSubscriptionStatus(userId, subscription, projectCount);
        } else {
          const { data: profile } = await supabaseAdmin
            .from("profiles")
            .select("id")
            .eq("stripe_customer_id", subscription.customer as string)
            .single();

          if (profile) {
            await updateSubscriptionStatus(profile.id, subscription, projectCount);
          }
        }

        console.log(`Subscription updated`);
        break;
      }

      // Handle subscription deleted/canceled
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        
        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("id")
          .eq("stripe_subscription_id", subscription.id)
          .single();

        if (profile) {
          await supabaseAdmin
            .from("profiles")
            .update({
              subscription_status: "canceled",
              stripe_subscription_id: null,
              project_limit: 1,
            })
            .eq("id", profile.id);

          console.log(`Subscription canceled for user ${profile.id}`);
        }
        break;
      }

      // Handle invoice payment succeeded (subscription renewal)
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        
        if (invoice.subscription && invoice.billing_reason === "subscription_cycle") {
          const { data: profile } = await supabaseAdmin
            .from("profiles")
            .select("id")
            .eq("stripe_subscription_id", invoice.subscription as string)
            .single();

          if (profile) {
            // Create purchase record for renewal
            await supabaseAdmin.from("purchases").insert({
              user_id: profile.id,
              stripe_customer_id: invoice.customer as string,
              stripe_subscription_id: invoice.subscription as string,
              plan_type: "subscription",
              status: "active",
              amount: invoice.amount_paid,
              currency: invoice.currency,
            });

            console.log(`Subscription renewed for user ${profile.id}`);
          }
        }
        break;
      }

      // Handle invoice payment failed
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        
        if (invoice.subscription) {
          const { data: profile } = await supabaseAdmin
            .from("profiles")
            .select("id")
            .eq("stripe_subscription_id", invoice.subscription as string)
            .single();

          if (profile) {
            await supabaseAdmin
              .from("profiles")
              .update({ subscription_status: "past_due" })
              .eq("id", profile.id);

            console.log(`Payment failed for user ${profile.id}`);
          }
        }
        break;
      }

      // Handle refunds (for lifetime purchases)
      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
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

async function updateSubscriptionStatus(
  userId: string, 
  subscription: Stripe.Subscription,
  projectCount: number
) {
  let status: "none" | "active" | "past_due" | "canceled" | "trialing" = "none";
  
  switch (subscription.status) {
    case "active":
      status = "active";
      break;
    case "trialing":
      status = "trialing";
      break;
    case "past_due":
      status = "past_due";
      break;
    case "canceled":
    case "unpaid":
      status = "canceled";
      break;
    default:
      status = "none";
  }

  await supabaseAdmin
    .from("profiles")
    .update({
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer as string,
      subscription_status: status,
      subscription_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      project_limit: projectCount,
    })
    .eq("id", userId);
}
