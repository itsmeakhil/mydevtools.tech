"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Copy, RotateCcw, ShieldCheck } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import {QRCodeSVG} from "qrcode.react"
import { authenticator } from "otplib"

export default function OTPGenerator() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Main Generator */}
        <OTPGeneratorMain />
      </div>
    </div>
  )
}

function OTPGeneratorMain() {
  const [secret, setSecret] = useState("RPOPN5X2Q25JHZ3")
  const [hexSecret, setHexSecret] = useState("8bdcf6f6fa86ba93eb3b")
  const [otps, setOtps] = useState({
    previous: "",
    current: "",
    next: "",
  })
  const [epoch, setEpoch] = useState("")
  const [progress, setProgress] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [iteration] = useState("57993195")
  const [paddedHex] = useState("000000000374e7eb")

  const { toast } = useToast()

  const regenerateSecret = useCallback(() => {
 
    const newSecret = authenticator.generateSecret()
    setSecret(newSecret)

    const base32Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"
    const binary = newSecret
      .split("")
      .map(char => base32Chars.indexOf(char).toString(2).padStart(5, "0"))
      .join("")
    
    const hex = binary
      .match(/.{1,4}/g)
      ?.map(chunk => parseInt(chunk, 2).toString(16))
      .join("")
    
    setHexSecret(hex || "")
  }, [])

  // Generate OTP codes
  const generateOTPs = useCallback(() => {
    const now = Date.now()
    const currentEpoch = Math.floor(now / 1000)
    const currentCounter = Math.floor(currentEpoch / 30)
    
    try {
      // Previous window
      authenticator.options = { epoch: (currentCounter - 1) * 30 * 1000 }
      const prevOTP = authenticator.generate(secret)
      
      // Current window
      authenticator.options = { epoch: currentCounter * 30 * 1000 }
      const currentOTP = authenticator.generate(secret)
      
      // Next window
      authenticator.options = { epoch: (currentCounter + 1) * 30 * 1000 }
      const nextOTP = authenticator.generate(secret)
      
      // Reset options
      authenticator.options = {}

      setOtps({
        previous: prevOTP,
        current: currentOTP,
        next: nextOTP,
      })
    } catch (error) {
      console.error("Error generating OTP:", error)
    }
  }, [secret])

  // Smooth progress bar animation
  useEffect(() => {
    let animationFrameId: number

    const animate = () => {
      const now = Date.now()
      const currentEpoch = Math.floor(now / 1000)
      const secondsInWindow = currentEpoch % 30
      const millisecondsOffset = now % 1000

      // Update epoch continuously
      setEpoch(currentEpoch.toString())
      
      // Calculate progress (0-100)
      const newProgress = ((secondsInWindow * 1000 + millisecondsOffset) / (30 * 1000)) * 100
      setProgress(newProgress)
      setTimeLeft(29 - secondsInWindow)

      // Generate new OTPs when we cross the 30-second boundary
      if (secondsInWindow === 0 && millisecondsOffset < 50) {
        generateOTPs()
      }

      animationFrameId = requestAnimationFrame(animate)
    }

    generateOTPs() // Initial generation
    animationFrameId = requestAnimationFrame(animate)

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [generateOTPs])

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      description: `${label} copied to clipboard`,
    })
  }

  return (
    <Card className="border-2 shadow-lg">
      <CardHeader>
        <div className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl font-bold text-primary">
            <div className="p-2 bg-primary/10 rounded-lg shadow-sm">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            OTP Code Generator
          </CardTitle>
          <CardDescription className="mt-2">
            Generate and validate time-based OTP (one time password) for multi-factor authentication.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Secret Fields */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Secret</label>
            <div className="flex gap-2">
              <Input value={secret} readOnly />
              <Button variant="outline" size="icon" onClick={() => copyToClipboard(secret, "Secret")}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={regenerateSecret}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Secret in hexadecimal</label>
            <div className="flex gap-2">
              <Input value={hexSecret} readOnly />
              <Button variant="outline" size="icon" onClick={() => copyToClipboard(hexSecret, "Hexadecimal secret")}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* OTP Display */}
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-sm font-medium mb-2">Previous</div>
              <div className="bg-muted p-3 rounded-md">{otps.previous}</div>
            </div>
            <div>
              <div className="text-sm font-medium mb-2">Current OTP</div>
              <div className="bg-primary/10 p-3 rounded-md text-xl font-bold">{otps.current}</div>
            </div>
            <div>
              <div className="text-sm font-medium mb-2">Next</div>
              <div className="bg-muted p-3 rounded-md">{otps.next}</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Next in {timeLeft}s</span>
              <span>Epoch</span>
            </div>
            <div className="flex gap-2">
              <Progress value={progress} className="flex-1 transition-all duration-300" />
              <div className="flex gap-2">
                <Input value={epoch} readOnly className="w-32" />
                <Button variant="outline" size="icon" onClick={() => copyToClipboard(epoch, "Epoch")}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* QR Code and Details Section */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* QR Code */}
          <div className="flex justify-center items-start">
            <QRCodeSVG
              value={`otpauth://totp/Example:user@example.com?secret=${secret}&issuer=Example`}
              size={200}
              level="H"
              includeMargin={true}
            />
          </div>

          {/* Details Section */}
          <div className="space-y-4">
            {/* Iteration Details */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Count:</label>
                <div className="flex gap-2">
                  <Input value={iteration} readOnly />
                  <Button variant="outline" size="icon" onClick={() => copyToClipboard(iteration, "Count")}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Padded hex:</label>
                <div className="flex gap-2">
                  <Input value={paddedHex} readOnly />
                  <Button variant="outline" size="icon" onClick={() => copyToClipboard(paddedHex, "Padded hex")}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() =>
                window.open(`otpauth://totp/Example:user@example.com?secret=${secret}&issuer=Example`, "_blank")
              }
            >
              Open Key URL in new tab
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

