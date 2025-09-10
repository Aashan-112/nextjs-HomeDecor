import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

export const dynamic = "force-dynamic"

// Initialize Stripe only when the secret key is available
const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY environment variable is not set")
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-08-27.basil",
  })
}

export async function POST(req: NextRequest) {
  // Additional runtime check for environment variables
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error("STRIPE_SECRET_KEY environment variable is not set")
    return NextResponse.json(
      { 
        success: false,
        error: "Payment service is not properly configured. Please contact support." 
      },
      { status: 500 }
    )
  }

  try {
    const stripe = getStripe()
    const { amount, currency, orderId, orderNumber, customerEmail, customerPhone, shippingAddress } = await req.json()

    // Validate required fields
    if (!amount || !orderId || !customerEmail) {
      return NextResponse.json(
        { error: "Missing required payment data" },
        { status: 400 }
      )
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents/paisa
      currency: currency.toLowerCase(),
      metadata: {
        orderId,
        orderNumber: orderNumber || orderId,
        customerEmail,
        customerPhone: customerPhone || '',
        shippingCity: shippingAddress?.city || '',
        shippingProvince: shippingAddress?.province || '',
      },
      description: `Payment for Order #${orderNumber || orderId}`,
      receipt_email: customerEmail,
      shipping: shippingAddress ? {
        name: shippingAddress.name,
        address: {
          line1: shippingAddress.address,
          city: shippingAddress.city,
          state: shippingAddress.province,
          postal_code: shippingAddress.postalCode,
          country: 'PK'
        }
      } : undefined,
    })

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      message: "Payment intent created successfully"
    })
  } catch (error: any) {
    console.error("Stripe payment intent creation failed:", error)
    return NextResponse.json(
      { 
        success: false,
        error: error.message || "Failed to create payment intent" 
      },
      { status: 500 }
    )
  }
}
