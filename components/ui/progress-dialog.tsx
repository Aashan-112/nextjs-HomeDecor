"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ProgressDialogProps {
  open: boolean
  onOpenChange?: (open: boolean) => void
  title: string
  description?: string
  progress?: number // 0-100, undefined for indeterminate
  status?: "loading" | "success" | "error"
  message?: string
  onClose?: () => void
  showCloseButton?: boolean
}

export function ProgressDialog({
  open,
  onOpenChange,
  title,
  description,
  progress,
  status = "loading",
  message,
  onClose,
  showCloseButton = false
}: ProgressDialogProps) {
  const handleClose = () => {
    if (onClose) onClose()
    if (onOpenChange) onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={showCloseButton ? onOpenChange : undefined}>
      <DialogContent className="sm:max-w-md" showCloseButton={showCloseButton}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4 py-4">
          {/* Status Icon */}
          {status === "loading" && (
            <LoadingSpinner size="lg" />
          )}
          {status === "success" && (
            <CheckCircle className="h-12 w-12 text-green-600" />
          )}
          {status === "error" && (
            <XCircle className="h-12 w-12 text-red-600" />
          )}

          {/* Description */}
          {description && (
            <p className="text-sm text-muted-foreground text-center">
              {description}
            </p>
          )}

          {/* Progress Bar */}
          {status === "loading" && progress !== undefined && (
            <div className="w-full space-y-2">
              <Progress value={progress} className="w-full" />
              <p className="text-xs text-center text-muted-foreground">
                {progress}% complete
              </p>
            </div>
          )}

          {/* Status Message */}
          {message && (
            <p className="text-sm text-center">
              {message}
            </p>
          )}

          {/* Close Button */}
          {(status !== "loading" || showCloseButton) && (
            <Button 
              onClick={handleClose}
              variant={status === "error" ? "destructive" : "default"}
            >
              {status === "error" ? "Close" : "Continue"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
