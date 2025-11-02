"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Monitor } from "lucide-react"

interface DeviceInfo {
  screen: {
    size: string
    orientation: string
    angle: number
    pixelRatio: number
    colorDepth: number
    windowSize: string
  }
  device: {
    browserVendor: string
    platform: string
    languages: string
    userAgent: string
  }
}

export default function DeviceInformation() {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    screen: {
      size: "Loading...",
      orientation: "Loading...",
      angle: 0,
      pixelRatio: 1,
      colorDepth: 0,
      windowSize: "Loading...",
    },
    device: {
      browserVendor: "Loading...",
      platform: "Loading...",
      languages: "Loading...",
      userAgent: "Loading...",
    },
  })

  useEffect(() => {
    const updateDeviceInfo = () => {
      setDeviceInfo({
        screen: {
          size: `${window.screen.width} x ${window.screen.height}`,
          orientation: screen.orientation?.type || "N/A",
          angle: screen.orientation?.angle || 0,
          pixelRatio: window.devicePixelRatio,
          colorDepth: screen.colorDepth,
          windowSize: `${window.innerWidth} x ${window.innerHeight}`,
        },
        device: {
          browserVendor: navigator.vendor,
          platform: navigator.platform,
          languages: navigator.languages.join(", "),
          userAgent: navigator.userAgent,
        },
      })
    }

    updateDeviceInfo()
    window.addEventListener("resize", updateDeviceInfo)
    screen.orientation?.addEventListener("change", updateDeviceInfo)

    return () => {
      window.removeEventListener("resize", updateDeviceInfo)
      screen.orientation?.removeEventListener("change", updateDeviceInfo)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <div className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-2xl font-bold text-primary">
                <div className="p-2 bg-primary/10 rounded-lg shadow-sm">
                  <Monitor className="h-5 w-5 text-primary" />
                </div>
                Device Information
              </CardTitle>
              <CardDescription className="mt-2">
                Get information about your current device (screen size, pixel-ratio, user agent, ...)
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Screen</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Screen size</p>
                    <p className="font-mono">{deviceInfo.screen.size}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Orientation</p>
                    <p className="font-mono">{deviceInfo.screen.orientation}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Orientation angle</p>
                    <p className="font-mono">{deviceInfo.screen.angle}°</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Color depth</p>
                    <p className="font-mono">{deviceInfo.screen.colorDepth} bits</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Pixel ratio</p>
                    <p className="font-mono">{deviceInfo.screen.pixelRatio} dppx</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Window size</p>
                    <p className="font-mono">{deviceInfo.screen.windowSize}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Device</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Browser vendor</p>
                    <p className="font-mono">{deviceInfo.device.browserVendor}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Platform</p>
                    <p className="font-mono">{deviceInfo.device.platform}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Languages</p>
                    <p className="font-mono">{deviceInfo.device.languages}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">User agent</p>
                    <p className="font-mono text-xs leading-tight break-all" title={deviceInfo.device.userAgent}>
                      {deviceInfo.device.userAgent}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

