import { Toaster } from "sonner"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-auto pt-2 bg-background">
      {children}
      <Toaster />
    </div>
  )
}

