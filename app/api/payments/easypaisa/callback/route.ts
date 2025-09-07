import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'

/**
 * EasyPaisa Payment Callback Handler
 * Handles payment completion callbacks from EasyPaisa
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = createClient()
    
    // Extract EasyPaisa callback parameters
    const callbackData = {
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
      customer_email: body.customer_email,
      transaction_date: body.transaction_date,
      secure_hash: body.secure_hash,
      reference_no: body.reference_no
    }

    console.log('EasyPaisa Callback:', callbackData)

    // Verify callback authenticity (in production, verify the secure hash)
    const isValidCallback = verifyEasyPaisaCallback(callbackData)
    
    if (!isValidCallback) {
      return NextResponse.json(
        { error: 'Invalid callback signature' },
        { status: 400 }
      )
    }

    const orderNumber = callbackData.order_id
    const transactionId = callbackData.transaction_id
    const responseCode = callbackData.response_code
    const amount = parseFloat(callbackData.amount)

    // Determine payment status based on EasyPaisa response
    let paymentStatus = 'failed'
    let orderStatus = 'payment_failed'
    
    if (callbackData.status === 'SUCCESS' || responseCode === '0000') {
      paymentStatus = 'completed'
      orderStatus = 'confirmed'
    } else if (callbackData.status === 'PENDING' || responseCode === '0001') {
      paymentStatus = 'pending'
      orderStatus = 'pending'
    }

    // Find the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('order_number', orderNumber)
      .single()

    if (orderError || !order) {
      console.error('Order not found:', orderNumber)
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Update order with payment information
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: orderStatus,
        payment_status: paymentStatus,
        transaction_id: transactionId,
        payment_method: 'easypaisa',
        payment_confirmed_at: paymentStatus === 'completed' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', order.id)

    if (updateError) {
      console.error('Failed to update order:', updateError)
      return NextResponse.json(
        { error: 'Failed to update order' },
        { status: 500 }
      )
    }

    // Log the payment transaction
    await supabase
      .from('payment_transactions')
      .insert({
        order_id: order.id,
        payment_method: 'easypaisa',
        transaction_id: transactionId,
        amount: amount,
        status: paymentStatus,
        gateway_response: callbackData,
        created_at: new Date().toISOString()
      })

    // Send response back to EasyPaisa
    return NextResponse.json({
      status: 'success',
      message: 'Payment processed successfully'
    })

  } catch (error) {
    console.error('EasyPaisa callback error:', error)
    return NextResponse.json(
      { error: 'Payment processing failed' },
      { status: 500 }
    )
  }
}

/**
 * Handle GET requests for EasyPaisa return URL
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const orderId = searchParams.get('order_id')
  const status = searchParams.get('status')
  const transactionId = searchParams.get('transaction_id')

  let redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/checkout`

  if (status === 'SUCCESS' && orderId) {
    redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/account/orders/${orderId}?payment=success&transaction=${transactionId}`
  } else if (status === 'FAILED') {
    redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/checkout?payment=failed&reason=easypaisa_failed`
  } else if (status === 'CANCELLED') {
    redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/checkout?payment=cancelled&reason=user_cancelled`
  }

  return NextResponse.redirect(redirectUrl)
}

/**
 * Verify EasyPaisa callback authenticity
 */
function verifyEasyPaisaCallback(data: any): boolean {
  try {
    // In production, you would verify the secure hash using your EasyPaisa secret key
    // const secretKey = process.env.EASYPAISA_SECRET_KEY
    // const hashData = `${data.merchant_id}${data.transaction_id}${data.order_id}${data.amount}${data.currency}${data.status}`
    // const computedHash = crypto.createHmac('sha256', secretKey).update(hashData).digest('hex')
    // return computedHash.toUpperCase() === data.secure_hash?.toUpperCase()
    
    // For development, always return true
    return true
  } catch (error) {
    console.error('Hash verification failed:', error)
    return false
  }
}
