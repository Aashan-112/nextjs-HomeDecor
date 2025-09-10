import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

function generateDiscountCode(prefix = "WELCOME15") {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `${prefix}-${rand}`
}

async function sendDiscountEmail(email: string, code: string) {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.FROM_EMAIL || "no-reply@yourstore.com"
  const company = process.env.COMPANY_NAME || "Your Store"

  if (!apiKey) {
    console.warn("[SUBSCRIBE] RESEND_API_KEY missing; skipping email send")
    return { ok: false, skipped: true }
  }

  const subject = `Your ${company} 15% discount code`
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Welcome to ${company}! 🎉</h2>
      <p>Thanks for subscribing. Here's your <strong>15% off</strong> discount code:</p>
      <p style="font-size: 20px; font-weight: bold; letter-spacing: 2px;">${code}</p>
      <p>Apply this code at checkout. Valid for 30 days, one-time use.</p>
      <p>Happy shopping!<br/>— ${company}</p>
    </div>
  `

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ from, to: email, subject, html }),
  })

  if (!res.ok) {
    const txt = await res.text().catch(() => "")
    console.error("[SUBSCRIBE] Resend email failed:", res.status, txt)
    return { ok: false }
  }
  return { ok: true }
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ ok: false, error: "Valid email is required" }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    const supabase = supabaseUrl && serviceRoleKey
      ? createClient(supabaseUrl, serviceRoleKey)
      : null

    // Check if already subscribed
    let alreadySubscribed = false
    if (supabase) {
      const { data, error } = await supabase
        .from("newsletter_subscribers")
        .select("id, created_at")
        .ilike("email", email)
        .maybeSingle()
      if (error && error.code !== 'PGRST116') {
        console.warn("[SUBSCRIBE] Subscriber lookup error:", error)
      }
      alreadySubscribed = !!data
    }

    // Generate discount code
    const code = generateDiscountCode()
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days

    // Store records if DB available
    if (supabase) {
      if (!alreadySubscribed) {
        const { error: subErr } = await supabase
          .from("newsletter_subscribers")
          .insert({ email })
        if (subErr) console.warn("[SUBSCRIBE] Failed to insert subscriber:", subErr)
      }

      // Upsert a code bound to email
      const { error: codeErr } = await supabase
        .from("discount_codes")
        .insert({
          code,
          type: 'percent',
          percent_off: 15,
          email,
          usage_limit: 1,
          used_count: 0,
          expires_at: expiresAt,
          active: true,
          metadata: { origin: 'newsletter' }
        })
      if (codeErr) console.warn("[SUBSCRIBE] Failed to insert discount code:", codeErr)
    }

    // Send email (best-effort)
    sendDiscountEmail(email, code).catch((e) => console.warn("[SUBSCRIBE] send email async err", e))

    return NextResponse.json({ ok: true, code, percentOff: 15, expiresAt, alreadySubscribed })
  } catch (e: any) {
    console.error("[SUBSCRIBE] Unexpected error:", e)
    return NextResponse.json({ ok: false, error: e.message || "Unexpected error" }, { status: 500 })
  }
}

