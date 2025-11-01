"use client"

import { useState, useEffect, useCallback } from "react"
import QRCode, { QRCodeErrorCorrectionLevel } from "qrcode"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { QrCode, Download, Palette } from "lucide-react"

export default function QRCodeGenerator() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Hero Section */}
        <Card className="border-2 shadow-lg bg-gradient-to-br from-primary/5 via-primary/5 to-muted/10">
          <div className="p-8 md:p-12 text-center space-y-4">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <QrCode className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              QR Code Generator
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Generate beautiful, customizable QR codes for URLs, text, and more. Download as PNG.
            </p>
          </div>
        </Card>

        {/* Main Generator */}
        <QRCodeGeneratorMain />
      </div>
    </div>
  )
}

function QRCodeGeneratorMain() {
  const [text, setText] = useState("https://mydevtools.tech")
  const [foregroundColor, setForegroundColor] = useState("#000000")
  const [backgroundColor, setBackgroundColor] = useState("#ffffff")
  const [errorCorrection, setErrorCorrection] = useState<"L" | "M" | "Q" | "H">("M")
  const [qrCode, setQrCode] = useState("")

  const generateQRCode = useCallback(async () => {
    if (!text) return
    try {
      const url = await QRCode.toDataURL(text, {
        errorCorrectionLevel: errorCorrection as QRCodeErrorCorrectionLevel,
        color: {
          dark: foregroundColor,
          light: backgroundColor,
        },
      })
      setQrCode(url)
    } catch (err) {
      console.error(err)
    }
  }, [text, foregroundColor, backgroundColor, errorCorrection])

  useEffect(() => {
    generateQRCode()
  }, [generateQRCode])

  const downloadQRCode = () => {
    const link = document.createElement("a")
    link.href = qrCode
    link.download = "qrcode.png"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Settings Panel */}
      <Card className="border-2 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Palette className="h-5 w-5 text-primary" />
            </div>
            Customize QR Code
          </CardTitle>
          <CardDescription className="mt-2">
            Configure colors and error correction settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="text">Content</Label>
            <Input 
              id="text" 
              value={text} 
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter URL or text..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="foreground">Foreground Color</Label>
            <div className="flex gap-2">
              <Input
                id="foreground"
                type="color"
                value={foregroundColor}
                onChange={(e) => setForegroundColor(e.target.value)}
                className="h-10 w-20"
              />
              <Input
                value={foregroundColor}
                onChange={(e) => setForegroundColor(e.target.value)}
                className="font-mono"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="background">Background Color</Label>
            <div className="flex gap-2">
              <Input
                id="background"
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="h-10 w-20"
              />
              <Input
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="font-mono"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="error-correction">Error Correction Level</Label>
            <Select
              value={errorCorrection}
              onValueChange={(value: "L" | "M" | "Q" | "H") => setErrorCorrection(value)}
            >
              <SelectTrigger id="error-correction">
                <SelectValue placeholder="Select error correction level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="L">Low (7%)</SelectItem>
                <SelectItem value="M">Medium (15%)</SelectItem>
                <SelectItem value="Q">Quartile (25%)</SelectItem>
                <SelectItem value="H">High (30%)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Higher levels allow more damage before the QR code becomes unreadable
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Preview Panel */}
      <Card className="border-2 shadow-lg">
        <CardHeader>
          <CardTitle>Preview & Download</CardTitle>
          <CardDescription className="mt-2">
            Your generated QR code
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center justify-center min-h-[400px] bg-muted/20 rounded-lg p-8">
            {qrCode ? (
              <>
                <div className="bg-white p-4 rounded-lg shadow-lg">
                  <Image src={qrCode} alt="Generated QR Code" width={256} height={256} priority />
                </div>
                <Button onClick={downloadQRCode} className="mt-6 w-full" size="lg">
                  <Download className="w-5 h-5 mr-2" />
                  Download QR Code
                </Button>
              </>
            ) : (
              <div className="text-center text-muted-foreground">
                <QrCode className="h-24 w-24 mx-auto mb-4 opacity-20" />
                <p>QR code preview will appear here</p>
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="bg-muted/50 rounded-lg p-4 border border-border">
            <h3 className="text-sm font-semibold mb-2">QR Code Tips</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Use High error correction for printed materials</li>
              <li>• Medium works well for digital displays</li>
              <li>• Keep foreground dark for better scanning</li>
              <li>• Test QR codes on multiple devices</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

