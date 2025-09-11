"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Gift, Heart, ShoppingCart, User, X } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"

interface AuthPromptDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function AuthPromptDialog({ isOpen, onClose }: AuthPromptDialogProps) {
  const { user, loading } = useAuth()
  const [shouldShow, setShouldShow] = useState(false)

  useEffect(() => {
    // Don't show if user is authenticated or still loading
    if (user || loading) {
      setShouldShow(false)
      return
    }

    // Check if we should show the dialog
    setShouldShow(isOpen)
  }, [user, loading, isOpen])

  if (!shouldShow) return null

  const benefits = [
    {
      icon: <ShoppingCart className="h-5 w-5 text-primary" />,
      title: "Faster Checkout",
      description: "Save your details for quick and easy purchases"
    },
    {
      icon: <Heart className="h-5 w-5 text-red-500" />,
      title: "Save Favorites",
      description: "Create a wishlist of items you love"
    },
    {
      icon: <Gift className="h-5 w-5 text-green-500" />,
      title: "Exclusive Offers",
      description: "Get access to member-only discounts and deals"
    },
    {
      icon: <User className="h-5 w-5 text-blue-500" />,
      title: "Order Tracking",
      description: "Keep track of all your orders in one place"
    }
  ]

  return (
    <Dialog open={shouldShow} onOpenChange={() => onClose()}>
      <div className="fixed inset-0 bg-black/20 backdrop-blur-md z-50" aria-hidden="true" />
      <DialogContent className="max-w-[95vw] sm:max-w-[800px] lg:max-w-[900px] p-0 gap-0 max-h-[90vh] overflow-y-auto bg-background/95 backdrop-blur-xl border border-white/20 shadow-2xl">
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 sm:top-4 right-2 sm:right-4 z-10 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background/90"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
          
          <div className="bg-gradient-to-r from-primary/10 via-background to-secondary/10 p-4 sm:p-6 pb-3 sm:pb-4">
            <DialogHeader className="space-y-2 sm:space-y-3">
              <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              </div>
              <DialogTitle className="text-center text-xl sm:text-2xl font-bold">
                Welcome to 99 Arts and Crafts!
              </DialogTitle>
              <DialogDescription className="text-center text-sm sm:text-base max-w-2xl mx-auto">
                Join our community for a better shopping experience
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-3 sm:p-4 lg:p-6 pt-3 sm:pt-4">
            {/* Mobile-optimized layout */}
            <div className="space-y-3 sm:space-y-4">
              {/* Benefits section - more compact on mobile */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                {benefits.map((benefit, index) => (
                  <Card key={index} className="border-0 bg-muted/30">
                    <CardContent className="p-2 sm:p-3 text-center space-y-1 sm:space-y-2">
                      <div className="flex justify-center">
                        {benefit.icon}
                      </div>
                      <h4 className="font-semibold text-xs sm:text-sm">{benefit.title}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed hidden sm:block">
                        {benefit.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Action buttons section */}
              <div className="flex flex-col gap-2 sm:gap-3">
                <Button asChild className="w-full h-10 sm:h-11" size="lg">
                  <Link href="/auth/sign-up">
                    Create Your Account
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="w-full h-10 sm:h-11" size="lg">
                  <Link href="/auth/login">
                    I Already Have an Account
                  </Link>
                </Button>
                
                <Button
                  variant="ghost" 
                  className="w-full text-sm text-muted-foreground hover:text-foreground"
                  onClick={onClose}
                >
                  Continue as Guest
                </Button>
              </div>

              <p className="text-xs text-center text-muted-foreground leading-relaxed max-w-md mx-auto">
                By creating an account, you agree to our terms of service.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
