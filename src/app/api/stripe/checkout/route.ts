import { createClient } from "@/lib/supabase/server";
import { stripe, PRICING_CONFIG, getCurrentPricing } from "@/lib/stripe/server";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pricing = getCurrentPricing();
    const isLifetime = PRICING_CONFIG.mode === "lifetime";

    // Check if user already has a purchase
    const { data: existingPurchase } = await supabase
      .from("purchases")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();

    if (existingPurchase) {
      return NextResponse.json({ error: "You already have an active plan" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      client_reference_id: user.id,
      mode: isLifetime ? "payment" : "subscription",
      line_items: [
        {
          price: pricing.priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/settings?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/settings?canceled=true`,
      metadata: {
        user_id: user.id,
        pricing_mode: PRICING_CONFIG.mode,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
