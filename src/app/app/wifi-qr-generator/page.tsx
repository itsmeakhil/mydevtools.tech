"use client"

import * as React from "react"
import Image from "next/image"
import { Heart } from "lucide-react"
import QRCode from "qrcode"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function WifiQRGenerator() {
  const [formData, setFormData] = React.useState({
    encryption: "WPA",
    ssid: "",
    password: "",
    hidden: false,
    fgColor: "#000000ff",
    bgColor: "#ffffff",
  })
  const [qrCode, setQrCode] = React.useState<string>("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [isFavorite, setIsFavorite] = React.useState(false)

  const generateQRCode = React.useCallback(async () => {
    try {
      const wifiString = `WIFI:T:${formData.encryption};S:${formData.ssid};P:${formData.password};H:${formData.hidden};`
      const qr = await QRCode.toDataURL(wifiString, {
        color: {
          dark: formData.fgColor,
          light: formData.bgColor,
        },
      })
      setQrCode(qr)
    } catch (err) {
      console.error("Error generating QR code:", err)
    }
  }, [formData])

  React.useEffect(() => {
    if (formData.ssid && formData.password) {
      generateQRCode()
    }
  }, [formData, generateQRCode])

  return (
    <div className="h-auto pt-6 flex items-center justify-center bg-background min-w-4xl">
      <Card className="w-full max-w-4xl p-6 space-y-6 shadow-sm">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4"
          onClick={() => setIsFavorite(!isFavorite)}
        >
          <Heart className={isFavorite ? "fill-primary" : ""} />
        </Button>

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-semibold">WiFi QR Code generator</h1>
          <p className="text-muted-foreground">
            Generate and download QR codes for quick connections to WiFi networks.
          </p>
        </div>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="encryption">Encryption method</Label>
            <Select
              value={formData.encryption}
              onValueChange={(value) => setFormData({ ...formData, encryption: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select encryption" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="WPA">WPA/WPA2</SelectItem>
                <SelectItem value="WEP">WEP</SelectItem>
                <SelectItem value="nopass">No Password</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="ssid">SSID</Label>
            <div className="flex items-center gap-4">
              <Input
                id="ssid"
                value={formData.ssid}
                onChange={(e) => setFormData({ ...formData, ssid: e.target.value })}
                placeholder="Your WiFi SSID..."
              />
              <div className="flex items-center gap-2">
                <Checkbox
                  id="hidden"
                  checked={formData.hidden}
                  onCheckedChange={(checked) => setFormData({ ...formData, hidden: checked as boolean })}
                />
                <Label htmlFor="hidden">Hidden SSID</Label>
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <div className="flex items-center gap-4">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Your WiFi Password..."
              />
              <div className="flex items-center gap-2">
                <Checkbox
                  id="showPassword"
                  checked={showPassword}
                  onCheckedChange={(checked) => setShowPassword(checked as boolean)}
                />
                <Label htmlFor="showPassword">Show Password</Label>
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="fgColor">Foreground color</Label>
            <Input
              id="fgColor"
              type="text"
              value={formData.fgColor}
              onChange={(e) => setFormData({ ...formData, fgColor: e.target.value })}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="bgColor">Background color</Label>
            <Input
              id="bgColor"
              type="text"
              value={formData.bgColor}
              onChange={(e) => setFormData({ ...formData, bgColor: e.target.value })}
            />
          </div>
        </div>
        {qrCode && (
          <div className="flex justify-center">
            <Image src={qrCode || "/placeholder.svg"} alt="WiFi QR Code" width={192} height={192} />
          </div>
        )}
      </Card>
    </div>
  )
}

