import { Toaster } from "sonner"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen p-4 bg-background">
      {children}
      <Toaster />
    </div>
  )
}

