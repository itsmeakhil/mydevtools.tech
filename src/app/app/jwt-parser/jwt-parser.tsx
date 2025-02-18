import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Heart } from "lucide-react"

const SAMPLE_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"

export function JWTParser() {
  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <div className="rounded-lg border bg-card shadow-sm p-6">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-grow text-center">
            <h1 className="text-4xl font-bold mb-2">JWT parser</h1>
            <p className="text-muted-foreground">Parse and decode your JSON Web Token (jwt) and display its content.</p>
          </div>
          <button className="text-muted-foreground hover:text-primary transition-colors ml-4">
            <Heart className="h-6 w-6" />
          </button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>JWT to decode</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea className="min-h-[100px] font-mono text-sm" value={SAMPLE_JWT} readOnly />
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader className="bg-muted py-2">
            <CardTitle className="text-sm">Header</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex gap-2">
                <span className="font-mono text-muted-foreground">alg</span>
                <span className="text-muted-foreground">(Algorithm)</span>
              </div>
              <div className="font-mono">HS256</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex gap-2">
                <span className="font-mono text-muted-foreground">typ</span>
                <span className="text-muted-foreground">(Type)</span>
              </div>
              <div className="font-mono">JWT</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-muted py-2">
            <CardTitle className="text-sm">Payload</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex gap-2">
                <span className="font-mono text-muted-foreground">sub</span>
                <span className="text-muted-foreground">(Subject)</span>
              </div>
              <div className="font-mono">1234567890</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex gap-2">
                <span className="font-mono text-muted-foreground">name</span>
                <span className="text-muted-foreground">(Full name)</span>
              </div>
              <div className="font-mono">John Doe</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex gap-2">
                <span className="font-mono text-muted-foreground">iat</span>
                <span className="text-muted-foreground">(Issued At)</span>
              </div>
              <div className="font-mono">
                1516239022 <span className="text-muted-foreground">(18/01/2018 07:00:22)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

