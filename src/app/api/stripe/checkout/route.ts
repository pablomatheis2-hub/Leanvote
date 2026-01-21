import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/server";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user already has lifetime access
    const { data: profile } = await supabase
      .from("profiles")
      .select("has_lifetime_access")
      .eq("id", user.id)
      .single();

    if (profile?.has_lifetime_access) {
      return NextResponse.json({ error: "You already have lifetime access" }, { status: 400 });
    }

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
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
