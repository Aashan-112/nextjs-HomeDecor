import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'

/**
 * JazzCash Payment Callback Handler
 * Handles payment completion callbacks from JazzCash
 */

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const supabase = createClient()
    
    // Extract JazzCash callback parameters
    const callbackData = {
      pp_Version: formData.get('pp_Version')?.toString(),
      pp_TxnType: formData.get('pp_TxnType')?.toString(),
      pp_Language: formData.get('pp_Language')?.toString(),
      pp_MerchantID: formData.get('pp_MerchantID')?.toString(),
      pp_SubMerchantID: formData.get('pp_SubMerchantID')?.toString(),
      pp_TxnRefNo: formData.get('pp_TxnRefNo')?.toString(),
      pp_Amount: formData.get('pp_Amount')?.toString(),
      pp_TxnCurrency: formData.get('pp_TxnCurrency')?.toString(),
      pp_TxnDateTime: formData.get('pp_TxnDateTime')?.toString(),
      pp_BillReference: formData.get('pp_BillReference')?.toString(),
      pp_Description: formData.get('pp_Description')?.toString(),
      pp_TxnExpiryDateTime: formData.get('pp_TxnExpiryDateTime')?.toString(),
      pp_ReturnURL: formData.get('pp_ReturnURL')?.toString(),
      pp_SecureHash: formData.get('pp_SecureHash')?.toString(),
      pp_ResponseCode: formData.get('pp_ResponseCode')?.toString(),
      pp_ResponseMessage: formData.get('pp_ResponseMessage')?.toString(),
      pp_AuthCode: formData.get('pp_AuthCode')?.toString(),
      pp_RetrievalReferenceNo: formData.get('pp_RetrievalReferenceNo')?.toString()
    }

    console.log('JazzCash Callback:', callbackData)

    // Verify callback authenticity (in production, verify the secure hash)
    const isValidCallback = verifyJazzCashCallback(callbackData)
    
    if (!isValidCallback) {
      return NextResponse.json(
        { error: 'Invalid callback signature' },
        { status: 400 }
      )
    }

    const orderNumber = callbackData.pp_BillReference
    const transactionId = callbackData.pp_TxnRefNo
    const responseCode = callbackData.pp_ResponseCode
    const amount = parseInt(callbackData.pp_Amount || '0') / 100 // Convert from paisa to PKR

    // Determine payment status based on JazzCash response code
    let paymentStatus = 'failed'
    let orderStatus = 'payment_failed'
    
    if (responseCode === '000') {
      paymentStatus = 'completed'
      orderStatus = 'confirmed'
    } else if (responseCode === '124') {
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
        payment_method: 'jazzcash',
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
        payment_method: 'jazzcash',
        transaction_id: transactionId,
        amount: amount,
        status: paymentStatus,
        gateway_response: callbackData,
        created_at: new Date().toISOString()
      })

    // Redirect user based on payment result
    const redirectUrl = paymentStatus === 'completed'
      ? `${process.env.NEXT_PUBLIC_SITE_URL}/account/orders/${order.id}?payment=success`
      : `${process.env.NEXT_PUBLIC_SITE_URL}/checkout?payment=failed&reason=jazzcash_${responseCode}`

    return NextResponse.redirect(redirectUrl)

  } catch (error) {
    console.error('JazzCash callback error:', error)
    return NextResponse.json(
      { error: 'Payment processing failed' },
      { status: 500 }
    )
  }
}

/**
 * Verify JazzCash callback authenticity
 */
function verifyJazzCashCallback(data: any): boolean {
  try {
    // In production, you would verify the secure hash using your JazzCash secret key
    // const secretKey = process.env.JAZZCASH_SECRET_KEY
    // const hashData = `${data.pp_Amount}&${data.pp_BillReference}&${data.pp_Description}&${data.pp_Language}&${data.pp_MerchantID}&${data.pp_ResponseCode}&${data.pp_ReturnURL}&${data.pp_SubMerchantID}&${data.pp_TxnCurrency}&${data.pp_TxnDateTime}&${data.pp_TxnExpiryDateTime}&${data.pp_TxnRefNo}&${data.pp_TxnType}&${data.pp_Version}`
    // const computedHash = crypto.createHmac('sha256', secretKey).update(hashData).digest('hex')
    // return computedHash.toUpperCase() === data.pp_SecureHash?.toUpperCase()
    
    // For development, always return true
    return true
  } catch (error) {
    console.error('Hash verification failed:', error)
    return false
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({ message: 'JazzCash callback endpoint' })
}
