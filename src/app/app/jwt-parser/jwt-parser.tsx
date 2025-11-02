"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Key } from "lucide-react"
import { useState } from "react"

const SAMPLE_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"

interface JWTHeader {
  alg: string;
  typ: string;
}

interface JWTPayload {
  [key: string]: string | number | boolean | null;
}

export function JWTParser() {
  const [jwt, setJwt] = useState(SAMPLE_JWT);
  
  const parseJWT = (token: string) => {
    try {
      const [headerB64, payloadB64] = token.split('.');
      const header = JSON.parse(atob(headerB64)) as JWTHeader;
      const payload = JSON.parse(atob(payloadB64)) as JWTPayload;
      return { header, payload };
    } catch {
      return { header: { alg: '', typ: '' }, payload: {} };
    }
  };

  const { header, payload } = parseJWT(jwt);

  const formatDate = (timestamp: number) => {
    try {
      return new Date(timestamp * 1000).toLocaleString();
    } catch {
      return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <div className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-2xl font-bold text-primary">
                <div className="p-2 bg-primary/10 rounded-lg shadow-sm">
                  <Key className="h-5 w-5 text-primary" />
                </div>
                JWT Parser
              </CardTitle>
              <CardDescription className="mt-2">
                Parse and decode your JSON Web Token (jwt) and display its content.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">

            <Card>
              <CardHeader>
                <CardTitle>JWT to decode</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea 
                  className="min-h-[100px] font-mono text-sm" 
                  value={jwt}
                  onChange={(e) => setJwt(e.target.value)}
                  placeholder="Paste your JWT here"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="bg-muted py-2">
                <CardTitle className="text-sm">Header</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex gap-2">
                    <span className="font-mono text-muted-foreground">alg</span>
                    <span className="text-muted-foreground">(Algorithm)</span>
                  </div>
                  <div className="font-mono">{header.alg}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex gap-2">
                    <span className="font-mono text-muted-foreground">typ</span>
                    <span className="text-muted-foreground">(Type)</span>
                  </div>
                  <div className="font-mono">{header.typ}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="bg-muted py-2">
                <CardTitle className="text-sm">Payload</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 pt-4">
                {Object.entries(payload).map(([key, value]) => (
                  <div key={key} className="grid grid-cols-2 gap-4">
                    <div className="flex gap-2">
                      <span className="font-mono text-muted-foreground">{key}</span>
                      {key === 'iat' && <span className="text-muted-foreground">(Issued At)</span>}
                      {key === 'exp' && <span className="text-muted-foreground">(Expiration)</span>}
                      {key === 'sub' && <span className="text-muted-foreground">(Subject)</span>}
                    </div>
                    <div className="font-mono">
                      {typeof value === 'number' && (key === 'iat' || key === 'exp') 
                        ? <>{value} <span className="text-muted-foreground">({formatDate(value)})</span></>
                        : String(value)
                      }
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

