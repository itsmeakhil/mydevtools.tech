import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { HTMLEntityConverter } from "./html-entity-converter"
import { FileCode } from "lucide-react"

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <div className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-2xl font-bold text-primary">
                <div className="p-2 bg-primary/10 rounded-lg shadow-sm">
                  <FileCode className="h-5 w-5 text-primary" />
                </div>
                Escape HTML Entities
              </CardTitle>
              <CardDescription className="mt-2">
                Escape or unescape HTML entities (replace characters like {'<,>, &, "'} and \ with their HTML version)
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <HTMLEntityConverter />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

