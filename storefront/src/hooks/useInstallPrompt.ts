import { useContext } from "react"
import { InstallPromptContext } from "@/context/InstallPromptContext"

export function useInstallPrompt() {
  const context = useContext(InstallPromptContext)

  if (!context) {
    throw new Error("useInstallPrompt deve ser usado dentro de um InstallPromptProvider")
  }

  return context
}
