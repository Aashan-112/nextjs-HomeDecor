import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

// Initialize Stripe only when the secret key is available
const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY environment variable is not set")
  }
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    throw new Error("STRIPE_WEBHOOK_SECRET environment variable is not set")
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-08-27.basil",
  })
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const stripe = getStripe()
  const body = await req.text()
  const sig = req.headers.get("stripe-signature")!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message)
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    )
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      await handlePaymentSuccess(paymentIntent)
      break
      
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object as Stripe.PaymentIntent
      await handlePaymentFailed(failedPayment)
      break
      
    default:
      console.log(`Unhandled event type ${event.type}`)
  }

  return NextResponse.json({ received: true })
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  try {
    const orderId = paymentIntent.metadata.orderId
    const orderNumber = paymentIntent.metadata.orderNumber

    console.log(`🔔 [STRIPE WEBHOOK] Payment succeeded for order ${orderNumber}`)

    // Update order with payment details
    const { error } = await supabase
      .from('orders')
      .update({
        payment_status: 'paid',
        payment_confirmed_at: new Date().toISOString(),
        payment_id: paymentIntent.id,
        transaction_id: paymentIntent.id,
        status: 'processing' // Move from pending to processing
      })
      .eq('id', orderId)

    if (error) {
      console.error('Error updating order payment status:', error)
    } else {
      console.log(`✅ [STRIPE WEBHOOK] Order ${orderNumber} marked as paid`)
    }

    // TODO: Send confirmation email to customer
    // TODO: Notify admin of new paid order

  } catch (error) {
    console.error('Error handling payment success:', error)
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    const orderId = paymentIntent.metadata.orderId
    const orderNumber = paymentIntent.metadata.orderNumber

    console.log(`❌ [STRIPE WEBHOOK] Payment failed for order ${orderNumber}`)

    // Update order with failed payment status
    const { error } = await supabase
      .from('orders')
      .update({
        payment_status: 'failed',
        status: 'cancelled' // Cancel the order
      })
      .eq('id', orderId)

    if (error) {
      console.error('Error updating order payment status:', error)
    } else {
      console.log(`❌ [STRIPE WEBHOOK] Order ${orderNumber} marked as payment failed`)
    }

  } catch (error) {
    console.error('Error handling payment failure:', error)
  }
}
