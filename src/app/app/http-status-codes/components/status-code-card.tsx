import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { StatusCode } from "../types"

interface StatusCodeCardProps {
  statusCode: StatusCode
}

export function StatusCodeCard({ statusCode }: StatusCodeCardProps) {
  return (
    <Card className="bg-card/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">
          {statusCode.code} {statusCode.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{statusCode.description}</p>
      </CardContent>
    </Card>
  )
}

