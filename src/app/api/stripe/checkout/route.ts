import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { projectCount = 1, type = "subscription" } = body;

    // Check if user already has lifetime access
    const { data: profile } = await supabase
      .from("profiles")
      .select("has_lifetime_access, subscription_status, stripe_customer_id")
      .eq("id", user.id)
      .single();

    if (profile?.has_lifetime_access) {
      return NextResponse.json({ error: "You already have lifetime access" }, { status: 400 });
    }

    if (profile?.subscription_status === "active") {
      return NextResponse.json({ error: "You already have an active subscription" }, { status: 400 });
    }

    // Handle lifetime purchase (kept for future use)
    if (type === "lifetime") {
      const priceId = process.env.STRIPE_LIFETIME_PRICE_ID;
      
      if (!priceId) {
        console.error("STRIPE_LIFETIME_PRICE_ID not configured");
        return NextResponse.json({ error: "Payment not configured" }, { status: 500 });
      }

      const session = await stripe.checkout.sessions.create({
        customer_email: user.email,
        client_reference_id: user.id,
        mode: "payment",
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/dashboard/settings?success=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/dashboard/settings?canceled=true`,
        metadata: {
          user_id: user.id,
          type: "lifetime",
        },
      });

      return NextResponse.json({ url: session.url });
    }

    // Handle subscription checkout
    const subscriptionPriceId = process.env.STRIPE_SUBSCRIPTION_PRICE_ID;
    const addonPriceId = process.env.STRIPE_PROJECT_ADDON_PRICE_ID;
    
    if (!subscriptionPriceId) {
      console.error("STRIPE_SUBSCRIPTION_PRICE_ID not configured");
      return NextResponse.json({ error: "Payment not configured" }, { status: 500 });
    }

    const lineItems: Array<{ price: string; quantity: number }> = [
      {
        price: subscriptionPriceId,
        quantity: 1,
      },
    ];

    // Add additional projects if more than 1
    const additionalProjects = Math.max(0, projectCount - 1);
    if (additionalProjects > 0 && addonPriceId) {
      lineItems.push({
        price: addonPriceId,
        quantity: additionalProjects,
      });
    }

    // Get or create Stripe customer
    let customerId = profile?.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id,
        },
      });
      customerId = customer.id;

      // Save customer ID to profile
      await supabase
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id);
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      client_reference_id: user.id,
      mode: "subscription",
      line_items: lineItems,
      subscription_data: {
        trial_period_days: 7,
        metadata: {
          user_id: user.id,
          project_count: projectCount.toString(),
        },
      },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/dashboard/settings?canceled=true`,
      metadata: {
        user_id: user.id,
        type: "subscription",
        project_count: projectCount.toString(),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
