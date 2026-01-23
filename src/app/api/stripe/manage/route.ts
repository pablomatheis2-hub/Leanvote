import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/server";
import { NextRequest, NextResponse } from "next/server";

// Create a portal session for managing subscription
export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    if (!profile?.stripe_customer_id) {
      return NextResponse.json({ error: "No subscription found" }, { status: 400 });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/dashboard/settings`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe portal error:", error);
    return NextResponse.json({ error: "Failed to create portal session" }, { status: 500 });
  }
}

// Update subscription (change project count)
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { projectCount } = body;

    if (!projectCount || projectCount < 1) {
      return NextResponse.json({ error: "Invalid project count" }, { status: 400 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_subscription_id, stripe_customer_id")
      .eq("id", user.id)
      .single();

    if (!profile?.stripe_subscription_id) {
      return NextResponse.json({ error: "No active subscription found" }, { status: 400 });
    }

    // Get the subscription
    const subscription = await stripe.subscriptions.retrieve(profile.stripe_subscription_id);
    
    const subscriptionPriceId = process.env.STRIPE_SUBSCRIPTION_PRICE_ID;
    const addonPriceId = process.env.STRIPE_PROJECT_ADDON_PRICE_ID;

    if (!subscriptionPriceId) {
      return NextResponse.json({ error: "Subscription not configured" }, { status: 500 });
    }

    // Find the base subscription item and addon item
    const baseItem = subscription.items.data.find(item => item.price.id === subscriptionPriceId);
    const addonItem = subscription.items.data.find(item => item.price.id === addonPriceId);

    const additionalProjects = Math.max(0, projectCount - 1);
    const items: Array<{ id?: string; price?: string; quantity?: number; deleted?: boolean }> = [];

    // Keep base subscription
    if (baseItem) {
      items.push({ id: baseItem.id, quantity: 1 });
    }

    // Update or add/remove addon
    if (additionalProjects > 0) {
      if (addonItem) {
        items.push({ id: addonItem.id, quantity: additionalProjects });
      } else if (addonPriceId) {
        items.push({ price: addonPriceId, quantity: additionalProjects });
      }
    } else if (addonItem) {
      // Remove addon if no additional projects needed
      items.push({ id: addonItem.id, deleted: true });
    }

    // Update the subscription
    await stripe.subscriptions.update(profile.stripe_subscription_id, {
      items,
      proration_behavior: "create_prorations",
      metadata: {
        user_id: user.id,
        project_count: projectCount.toString(),
      },
    });

    // Update project limit in profile
    await supabase
      .from("profiles")
      .update({ project_limit: projectCount })
      .eq("id", user.id);

    return NextResponse.json({ success: true, projectCount });
  } catch (error) {
    console.error("Subscription update error:", error);
    return NextResponse.json({ error: "Failed to update subscription" }, { status: 500 });
  }
}
