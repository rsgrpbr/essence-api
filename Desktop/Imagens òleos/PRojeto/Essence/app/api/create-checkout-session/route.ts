import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not configured")
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-12-18.acacia",
})

const PRICE_IDS = {
  monthly: process.env.STRIPE_PRICE_ID_MONTHLY || "price_monthly_placeholder",
  quarterly: process.env.STRIPE_PRICE_ID_QUARTERLY || "price_quarterly_placeholder",
  annual: process.env.STRIPE_PRICE_ID_ANNUAL || "price_annual_placeholder",
}

export async function POST(req: NextRequest) {
  try {
    const { plan, userId, userEmail, couponCode, tracking } = await req.json()

    console.log("[v0 API] ========================================")
    console.log("[v0 API] Creating checkout session")
    console.log("[v0 API] Plan:", plan)
    console.log("[v0 API] User Email:", userEmail)
    console.log("[v0 API] User ID:", userId)
    console.log("[v0 API] Coupon Code:", couponCode || "none")
    console.log("[v0 API] Tracking Data:", tracking || "none")
    console.log("[v0 API] ========================================")

    if (!plan || (plan !== "monthly" && plan !== "quarterly" && plan !== "annual")) {
      console.error("[v0 API] ERROR: Invalid plan")
      return NextResponse.json({ error: "Plan deve ser 'monthly', 'quarterly' ou 'annual'" }, { status: 400 })
    }

    if (!userId) {
      console.error("[v0 API] ERROR: User ID is missing")
      return NextResponse.json({ error: "User ID é obrigatório" }, { status: 400 })
    }

    if (!userEmail) {
      console.error("[v0 API] ERROR: User email is missing")
      return NextResponse.json({ error: "Email do usuário é obrigatório" }, { status: 400 })
    }

    const priceId = PRICE_IDS[plan as "monthly" | "quarterly" | "annual"]
    console.log("[v0 API] Mapped Price ID:", priceId)

    const baseUrl = process.env.NEXT_PUBLIC_URL || `${req.nextUrl.protocol}//${req.nextUrl.host}`
    console.log("[v0 API] Base URL:", baseUrl)

    console.log("[v0 API] Calling Stripe API...")

    let session
    try {
      const sessionConfig: Stripe.Checkout.SessionCreateParams = {
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: `${baseUrl}/success`,
        cancel_url: `${baseUrl}/checkout`,
        metadata: {
          supabase_user_id: userId,
          plan: plan,
          coupon_code: couponCode || "",
          // Tracking metadata
          creative: tracking?.utm_content || "direct",
          campaign: tracking?.utm_campaign || "direct",
          source: tracking?.utm_source || "direct",
          medium: tracking?.utm_medium || "organic",
          fbclid: tracking?.fbclid || "",
        },
        subscription_data: {
          metadata: {
            fbp: tracking?._fbp || "",
            fbc: tracking?._fbc || "",
            ip_address: tracking?.ip || "",
            user_agent: tracking?.userAgent || "",
          },
        },
        customer_email: userEmail,
      }

      // Aplicar cupom se fornecido
      if (couponCode) {
        sessionConfig.discounts = [{
          coupon: couponCode
        }]
        console.log("[v0 API] Applying coupon:", couponCode)
      }

      session = await stripe.checkout.sessions.create(sessionConfig)
    } catch (stripeError: any) {
      console.error("[v0 API] Stripe API Error:", stripeError)
      console.error("[v0 API] Stripe Error Type:", stripeError.type)
      console.error("[v0 API] Stripe Error Code:", stripeError.code)
      console.error("[v0 API] Stripe Error Message:", stripeError.message)

      return NextResponse.json(
        {
          error: `Erro do Stripe: ${stripeError.message}`,
          details: stripeError.code || stripeError.type,
        },
        { status: 500 },
      )
    }

    console.log("[v0 API] ✅ Checkout session created successfully!")
    console.log("[v0 API] Session ID:", session.id)
    console.log("[v0 API] Session URL:", session.url)
    console.log("[v0 API] Metadata enviado ao Stripe:", {
      supabase_user_id: userId,
      plan: plan,
      coupon_code: couponCode || "none",
      tracking: tracking || "none",
    })
    console.log("[v0 API] ========================================")

    if (!session.url) {
      console.error("[v0 API] ERROR: Stripe did not return a checkout URL")
      return NextResponse.json({ error: "Erro ao gerar URL de checkout" }, { status: 500 })
    }

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    })
  } catch (err: any) {
    console.error("[v0 API] ❌ Unexpected error:", err)
    console.error("[v0 API] Error stack:", err.stack)
    return NextResponse.json(
      {
        error: err.message || "Erro interno do servidor",
        details: "Verifique os logs do servidor para mais detalhes",
      },
      { status: 500 },
    )
  }
}
