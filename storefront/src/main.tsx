import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { ThemeProvider } from "next-themes"
import { Toaster } from "@/components/ui/sonner"
import { InstallPromptProvider } from "@/context/InstallPromptContext"
import "./index.css"
import App from "./App.tsx"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <InstallPromptProvider>
        <BrowserRouter>
          <App />
          <Toaster position="top-center" />
        </BrowserRouter>
      </InstallPromptProvider>
    </ThemeProvider>
  </StrictMode>
)
