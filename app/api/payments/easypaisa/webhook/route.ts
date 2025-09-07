import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'

/**
 * EasyPaisa Webhook Handler
 * Handles asynchronous payment notifications from EasyPaisa
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = createClient()
    
    // Extract webhook parameters
    const webhookData = {
      merchant_id: body.merchant_id,
      transaction_id: body.transaction_id,
      order_id: body.order_id,
      amount: body.amount,
      currency: body.currency,
      status: body.status,
      response_code: body.response_code,
      response_message: body.response_message,
      payment_method: body.payment_method,
      customer_mobile: body.customer_mobile,
      transaction_date: body.transaction_date,
      secure_hash: body.secure_hash,
      webhook_type: body.webhook_type || 'payment_status_update'
    }

    console.log('EasyPaisa Webhook:', webhookData)

    // Verify webhook authenticity
    const isValidWebhook = verifyEasyPaisaWebhook(webhookData)
    
    if (!isValidWebhook) {
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 400 }
      )
    }

    // Log the webhook for audit purposes
    await supabase
      .from('webhook_logs')
      .insert({
        provider: 'easypaisa',
        webhook_type: webhookData.webhook_type,
        order_id: webhookData.order_id,
        transaction_id: webhookData.transaction_id,
        payload: webhookData,
        processed_at: new Date().toISOString()
      })

    const orderNumber = webhookData.order_id
    const transactionId = webhookData.transaction_id
    const amount = parseFloat(webhookData.amount)

    // Find the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('order_number', orderNumber)
      .single()

    if (orderError || !order) {
      console.error('Order not found for webhook:', orderNumber)
      // Still return success to prevent webhook retries for non-existent orders
      return NextResponse.json({ status: 'ignored', message: 'Order not found' })
    }

    // Don't process if already processed
    if (order.payment_status === 'completed' && webhookData.status === 'SUCCESS') {
      return NextResponse.json({ status: 'ignored', message: 'Payment already processed' })
    }

    // Determine payment status based on webhook
    let paymentStatus = 'failed'
    let orderStatus = 'payment_failed'
    
    switch (webhookData.status) {
      case 'SUCCESS':
        paymentStatus = 'completed'
        orderStatus = 'confirmed'
        break
      case 'PENDING':
        paymentStatus = 'pending'
        orderStatus = 'pending'
        break
      case 'FAILED':
      case 'CANCELLED':
        paymentStatus = 'failed'
        orderStatus = 'payment_failed'
        break
      default:
        paymentStatus = 'unknown'
        orderStatus = 'pending'
    }

    // Update order status
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: orderStatus,
        payment_status: paymentStatus,
        transaction_id: transactionId,
        payment_confirmed_at: paymentStatus === 'completed' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', order.id)

    if (updateError) {
      console.error('Failed to update order from webhook:', updateError)
      return NextResponse.json(
        { error: 'Failed to update order' },
        { status: 500 }
      )
    }

    // Update or insert payment transaction record
    await supabase
      .from('payment_transactions')
      .upsert({
        order_id: order.id,
        payment_method: 'easypaisa',
        transaction_id: transactionId,
        amount: amount,
        status: paymentStatus,
        gateway_response: webhookData,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'transaction_id'
      })

    // Send email notification if payment completed
    if (paymentStatus === 'completed' && order.payment_status !== 'completed') {
      try {
        // Here you would send confirmation email
        console.log(`Sending payment confirmation email for order ${orderNumber}`)
        // await sendPaymentConfirmationEmail(order, transactionId)
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError)
        // Don't fail the webhook for email errors
      }
    }

    return NextResponse.json({
      status: 'success',
      message: 'Webhook processed successfully',
      order_id: orderNumber,
      payment_status: paymentStatus
    })

  } catch (error) {
    console.error('EasyPaisa webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

/**
 * Verify EasyPaisa webhook authenticity
 */
function verifyEasyPaisaWebhook(data: any): boolean {
  try {
    // In production, verify the secure hash using your EasyPaisa secret key
    // const secretKey = process.env.EASYPAISA_SECRET_KEY
    // const hashString = `${data.merchant_id}${data.transaction_id}${data.order_id}${data.amount}${data.status}`
    // const computedHash = crypto.createHmac('sha256', secretKey).update(hashString).digest('hex')
    // return computedHash.toUpperCase() === data.secure_hash?.toUpperCase()
    
    // For development, always return true
    return true
  } catch (error) {
    console.error('Webhook verification failed:', error)
    return false
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    message: 'EasyPaisa webhook endpoint',
    status: 'active'
  })
}
