"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

export default function SignUpSuccessPage() {
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirect") || "/account"

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-background">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent">
              <Mail className="h-6 w-6 text-accent-foreground" />
            </div>
            <CardTitle className="text-2xl">Check Your Email</CardTitle>
            <CardDescription>We've sent you a confirmation link to complete your registration.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center text-sm text-muted-foreground">
              <p>Please check your email and click the confirmation link to activate your account.</p>
              <p className="mt-2">If you don't see the email, check your spam folder.</p>
              {redirectTo !== "/account" && (
                <p className="mt-2 text-accent">After confirmation, you'll be redirected to continue your journey.</p>
              )}
            </div>

            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link
                  href={`/auth/login${redirectTo !== "/account" ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`}
                >
                  Back to Login
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full bg-transparent">
                <Link href="/">Continue Shopping</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
