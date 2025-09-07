import { NextResponse } from "next/server"

export async function GET() {
  console.log('🧪 [TEST API] Test endpoint called')
  return NextResponse.json({ 
    ok: true, 
    message: "API routing is working",
    timestamp: new Date().toISOString()
  })
}
