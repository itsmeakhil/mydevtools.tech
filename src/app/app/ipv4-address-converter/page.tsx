"use client"

import * as React from "react"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { toast } from "sonner"

export default function IPv4Converter() {
  const [ipAddress, setIpAddress] = React.useState("192.168.1.1")
  const [isFavorite, setIsFavorite] = React.useState(false)

  // Convert IP address to different formats
  const convertIP = (ip: string) => {
    try {
      const parts = ip.split(".").map((part) => Number.parseInt(part))
      if (parts.length !== 4 || parts.some((part) => isNaN(part) || part < 0 || part > 255)) {
        throw new Error("Invalid IP address")
      }

      const decimal = parts.reduce((acc, part, i) => acc + part * Math.pow(256, 3 - i), 0)
      const hex = decimal.toString(16).toUpperCase().padStart(8, "0")
      const binary = decimal.toString(2).padStart(32, "0")
      const ipv6Full = `0000:0000:0000:0000:0000:ffff:${hex.slice(0, 4)}:${hex.slice(4)}`
      const ipv6Short = `::ffff:${hex.slice(0, 4)}:${hex.slice(4)}`

      return { decimal, hex, binary, ipv6Full, ipv6Short }
    } catch  {
      return {
        decimal: "0",
        hex: "00000000",
        binary: "0".padStart(32, "0"),
        ipv6Full: "0000:0000:0000:0000:0000:0000:0000:0000",
        ipv6Short: "::0",
      }
    }
  }

  const converted = convertIP(ipAddress)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard")
  }

  return (
    <div className="container max-w-4xl mx-auto p-4">
      <Card className="border shadow-sm">
        <CardHeader className="relative pb-2">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={() => setIsFavorite(!isFavorite)}
          >
            <Heart className={`h-5 w-5 ${isFavorite ? "fill-current text-red-500" : ""}`} />
          </Button>
          <h1 className="text-3xl font-bold text-center">IPv4 address converter</h1>
          <p className="text-muted-foreground text-center mt-2">
            Convert an IP address into decimal, binary, hexadecimal, or even an IPv6 representation of it.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="ipv4">The IPv4 address:</Label>
            <Input
              id="ipv4"
              value={ipAddress}
              onChange={(e) => setIpAddress(e.target.value)}
              placeholder="Enter IPv4 address"
            />
          </div>

          {[
            { label: "Decimal", value: converted.decimal },
            { label: "Hexadecimal", value: converted.hex },
            { label: "Binary", value: converted.binary },
            { label: "IPv6", value: converted.ipv6Full },
            { label: "IPv6 (short)", value: converted.ipv6Short },
          ].map(({ label, value }) => (
            <div key={label} className="grid grid-cols-[120px,1fr] gap-4 items-center">
              <Label className="text-right">{label}:</Label>
              <div className="flex gap-2">
                <Input readOnly value={value} className="font-mono" />
                <Button variant="outline" size="icon" onClick={() => copyToClipboard(String(value))}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                  </svg>
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

