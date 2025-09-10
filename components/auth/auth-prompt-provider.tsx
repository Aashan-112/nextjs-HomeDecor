"use client"

import { AuthPromptDialog } from "./auth-prompt-dialog"
import { useAuthPrompt } from "@/hooks/use-auth-prompt"

interface AuthPromptProviderProps {
  children: React.ReactNode
}

export function AuthPromptProvider({ children }: AuthPromptProviderProps) {
  const { isOpen, dismissDialog } = useAuthPrompt()

  return (
    <>
      {children}
      <AuthPromptDialog isOpen={isOpen} onClose={dismissDialog} />
    </>
  )
}
