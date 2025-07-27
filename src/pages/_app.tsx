import type { AppProps } from 'next/app'
import '../styles/globals.css';
import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from 'sonner';
import { ThemeProvider } from "@/components/theme-provider"

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <div className="min-h-screen">
        <Component {...pageProps} />
        <Toaster />
        <Sonner />
      </div>
    </ThemeProvider>
  )
}