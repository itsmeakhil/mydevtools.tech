import { Card, CardContent } from "@/components/ui/card"
import { HTMLEntityConverter } from "./html-entity-converter"

export default function Page() {
  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-5xl mx-auto shadow-sm">
        <CardContent className="p-6 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Escape HTML entities</h1>
            <p className="text-muted-foreground">
              Escape or unescape HTML entities (replace characters like {'<,>, &, "'} and \ with their HTML version)
            </p>
          </div>
          <HTMLEntityConverter />
        </CardContent>
      </Card>
    </div>
  )
}

