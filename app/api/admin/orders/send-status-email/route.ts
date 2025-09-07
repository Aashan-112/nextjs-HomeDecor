import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { Resend } from "resend"

export const dynamic = "force-dynamic"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  console.log('📧 [EMAIL API] Send status email endpoint called')
  
  try {
    const body = await req.json()
    const { orderId, orderNumber, customerName, status, customerEmail } = body
    
    console.log('📧 [EMAIL API] Request data:', {
      orderId,
      orderNumber,
      customerName,
      status
    })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('❌ [EMAIL API] Missing Supabase env vars')
      return NextResponse.json(
        { ok: false, error: "Missing Supabase configuration" },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)

    // Get customer email from auth.users table
    const { data: user, error: userError } = await supabase.auth.admin.getUserById(customerEmail)

    if (userError || !user?.user?.email) {
      console.error('❌ [EMAIL API] Could not fetch customer email:', userError)
      
      // Fallback: try to get email from order data itself
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('shipping_first_name, shipping_last_name, billing_first_name, billing_last_name')
        .eq('id', orderId)
        .single()
      
      if (orderError) {
        return NextResponse.json(
          { ok: false, error: "Could not find customer email or order data" },
          { status: 404 }
        )
      }
      
      // Use admin email as fallback since we can't get the real customer email
      const fallbackEmail = process.env.FROM_EMAIL || 'admin@example.com'
      const fromEmail = process.env.FROM_EMAIL || 'orders@example.com'
      const companyName = process.env.COMPANY_NAME || 'Your Store'
      
      console.log('⚠️ [EMAIL API] Customer email not accessible, sending to admin email as fallback')
      
      const emailContent = getEmailContent(status, orderNumber, customerName)
      
      try {
        // Send email to admin/fallback email since customer email is not accessible
        const emailResult = await resend.emails.send({
          from: fromEmail,
          to: [fallbackEmail],
          subject: `[ADMIN NOTIFICATION] ${emailContent.subject}`,
          text: `ADMIN NOTIFICATION: Customer email could not be accessed for order ${orderNumber}.\n\nOriginal email content:\n\n${emailContent.text}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h2 style="color: #333; margin: 0;">[ADMIN NOTIFICATION] Customer Email Issue</h2>
              </div>
              
              <p style="color: #d32f2f; font-weight: bold;">Customer email could not be accessed for order ${orderNumber}.</p>
              <p style="color: #333;">The following email content was intended for the customer:</p>
              
              <div style="border-left: 4px solid #ddd; padding-left: 16px; margin: 20px 0;">
                <h3 style="color: #333; margin-top: 0;">${emailContent.subject}</h3>
                ${emailContent.text.split('\n').map(line => 
                  line.trim() ? `<p style="color: #666; line-height: 1.6; margin: 8px 0;">${line}</p>` : '<br>'
                ).join('')}
              </div>
              
              <p style="color: #333;">Please manually contact the customer or resolve the email access issue.</p>
            </div>
          `
        })

        if (emailResult.error) {
          console.error('❌ [EMAIL API] Fallback email failed:', emailResult.error)
          return NextResponse.json(
            { ok: false, error: 'Failed to send fallback email: ' + emailResult.error.message },
            { status: 500 }
          )
        }

        console.log('✅ [EMAIL API] Fallback email sent to admin successfully! ID:', emailResult.data?.id)
        
        return NextResponse.json({ 
          ok: true, 
          message: 'Admin notification sent (customer email not accessible)',
          emailSent: {
            id: emailResult.data?.id,
            to: fallbackEmail,
            subject: `[ADMIN NOTIFICATION] ${emailContent.subject}`,
            status: 'sent_to_admin',
            provider: 'Resend',
            note: 'Customer email not accessible, sent to admin instead'
          }
        })

      } catch (emailError: any) {
        console.error('❌ [EMAIL API] Fallback email sending failed:', emailError)
        return NextResponse.json(
          { ok: false, error: 'Failed to send fallback email: ' + emailError.message },
          { status: 500 }
        )
      }
    }

    // Create status-specific email content function
    function getEmailContent(status: string, orderNumber: string, customerName: string) {
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
      const orderUrl = `${baseUrl}/orders/${orderId}`

      switch (status) {
        case 'pending':
          return {
            subject: `Order Confirmation - ${orderNumber}`,
            text: `Dear ${customerName},\n\nThank you for your order! Your order ${orderNumber} has been received and is currently pending processing.\n\nWe'll send you another email once your order ships.\n\nView your order: ${orderUrl}\n\nBest regards,\nThe Team`
          }
        case 'processing':
          return {
            subject: `Order Processing - ${orderNumber}`,
            text: `Dear ${customerName},\n\nGreat news! Your order ${orderNumber} is now being processed.\n\nWe're preparing your items for shipment and will notify you once they're on their way.\n\nView your order: ${orderUrl}\n\nBest regards,\nThe Team`
          }
        case 'shipped':
          return {
            subject: `Order Shipped - ${orderNumber}`,
            text: `Dear ${customerName},\n\nYour order ${orderNumber} has been shipped!\n\nYour items are on their way to you. You should receive them within 3-7 business days.\n\nView your order: ${orderUrl}\n\nBest regards,\nThe Team`
          }
        case 'delivered':
          return {
            subject: `Order Delivered - ${orderNumber}`,
            text: `Dear ${customerName},\n\nYour order ${orderNumber} has been delivered!\n\nWe hope you love your purchase. If you have any issues, please don't hesitate to contact us.\n\nView your order: ${orderUrl}\n\nThank you for your business!\n\nBest regards,\nThe Team`
          }
        case 'cancelled':
          return {
            subject: `Order Cancelled - ${orderNumber}`,
            text: `Dear ${customerName},\n\nYour order ${orderNumber} has been cancelled.\n\nIf you have any questions about this cancellation, please contact our support team.\n\nView your order: ${orderUrl}\n\nBest regards,\nThe Team`
          }
        default:
          return {
            subject: `Order Update - ${orderNumber}`,
            text: `Dear ${customerName},\n\nThere's been an update to your order ${orderNumber}.\n\nStatus: ${status}\n\nView your order: ${orderUrl}\n\nBest regards,\nThe Team`
          }
      }
    }

    const actualEmail = user.user.email
    // For Resend testing, override with your registered email if TEST_EMAIL_OVERRIDE is set
    const testEmailOverride = process.env.TEST_EMAIL_OVERRIDE
    const targetEmail = testEmailOverride || actualEmail
    
    const emailContent = getEmailContent(status, orderNumber, customerName)
    const fromEmail = process.env.FROM_EMAIL || 'orders@example.com'
    const companyName = process.env.COMPANY_NAME || 'Your Store'

    if (testEmailOverride) {
      console.log('📧 [EMAIL API] TEST MODE: Overriding email address for Resend testing')
      console.log('📧 [EMAIL API] Original customer email:', actualEmail)
      console.log('📧 [EMAIL API] Sending to test email instead:', targetEmail)
    }
    
    console.log('📧 [EMAIL API] Preparing to send real email to:', targetEmail)
    console.log('📧 [EMAIL API] Subject:', emailContent.subject)
    console.log('📧 [EMAIL API] From:', fromEmail)

    try {
      // Send real email using Resend
      const emailResult = await resend.emails.send({
        from: fromEmail,
        to: [targetEmail],
        subject: emailContent.subject,
        text: emailContent.text,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #333; margin: 0;">${companyName}</h2>
            </div>
            
            ${emailContent.text.split('\n').map(line => 
              line.trim() ? `<p style="color: #333; line-height: 1.6; margin: 12px 0;">${line}</p>` : '<br>'
            ).join('')}
            
            <div style="border-top: 1px solid #eee; margin-top: 30px; padding-top: 20px; text-align: center;">
              <p style="color: #666; font-size: 14px; margin: 0;">Order #${orderNumber}</p>
              <p style="color: #666; font-size: 12px; margin: 8px 0 0 0;">This is an automated message from ${companyName}</p>
            </div>
          </div>
        `
      })

      if (emailResult.error) {
        console.error('❌ [EMAIL API] Resend error:', emailResult.error)
        return NextResponse.json(
          { ok: false, error: 'Failed to send email: ' + emailResult.error.message },
          { status: 500 }
        )
      }

      console.log('✅ [EMAIL API] Real email sent successfully! ID:', emailResult.data?.id)
      
      return NextResponse.json({ 
        ok: true, 
        message: 'Status email sent successfully',
        emailSent: {
          id: emailResult.data?.id,
          to: targetEmail,
          originalCustomerEmail: actualEmail,
          subject: emailContent.subject,
          status: 'sent',
          provider: 'Resend',
          testMode: !!testEmailOverride
        }
      })

    } catch (emailError: any) {
      console.error('❌ [EMAIL API] Email sending failed:', emailError)
      return NextResponse.json(
        { ok: false, error: 'Failed to send email: ' + emailError.message },
        { status: 500 }
      )
    }

  } catch (error: any) {
    console.error('🚨 [EMAIL API] Unexpected error:', error)
    return NextResponse.json(
      { ok: false, error: error.message || 'Failed to send email' },
      { status: 500 }
    )
  }
}
