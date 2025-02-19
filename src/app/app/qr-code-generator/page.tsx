"use client"

import { useState, useEffect, useCallback } from "react"
import { Heart } from "lucide-react"
import QRCode, { QRCodeErrorCorrectionLevel } from "qrcode"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

export default function QRCodeGenerator() {
  const [text, setText] = useState("https://mydevtools.tech")
  const [foregroundColor, setForegroundColor] = useState("#000000ff")
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
    <div className="min-h-screen p-4 bg-background">
      <Card className="max-w-4xl mx-auto shadow-sm">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="text-center flex-grow">
              <h1 className="text-4xl font-bold mb-4">QR Code Generator</h1>
              <p className="text-muted-foreground text-center max-w-lg mx-auto">
                Generate and download a QR code for a URL (or just plain text), and customize the background and
                foreground colors.
              </p>
            </div>
            <Button variant="ghost" size="icon" className="ml-4">
              <Heart className="h-5 w-5" />
            </Button>
          </div>

          <div className="space-y-6 mt-8">
            <div className="grid gap-2">
              <Label htmlFor="text">Text:</Label>
              <Input id="text" value={text} onChange={(e) => setText(e.target.value)} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="foreground">Foreground color:</Label>
              <Input
                id="foreground"
                type="color"
                value={foregroundColor.slice(0, 7)}
                onChange={(e) => setForegroundColor(e.target.value + "ff")}
                className="h-10 w-full"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="background">Background color:</Label>
              <Input
                id="background"
                type="color"
                value={backgroundColor.slice(0, 7)}
                onChange={(e) => setBackgroundColor(e.target.value + "ff")}
                className="h-10 w-full"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="error-correction">Error resistance:</Label>
              <Select
                value={errorCorrection}
                onValueChange={(value: "L" | "M" | "Q" | "H") => setErrorCorrection(value)}
              >
                <SelectTrigger id="error-correction">
                  <SelectValue placeholder="Select error correction level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="L">Low</SelectItem>
                  <SelectItem value="M">Medium</SelectItem>
                  <SelectItem value="Q">High</SelectItem>
                  <SelectItem value="H">Very High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col items-center gap-4">
              {qrCode && (
                <>
                  <Image src={qrCode} alt="Generated QR Code" width={192} height={192} priority />
                  <Button onClick={downloadQRCode} className="w-full sm:w-auto">
                    Download QR code
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

