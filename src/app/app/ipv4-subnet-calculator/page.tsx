"use client"

import * as React from "react"
import { Network } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Netmask } from 'netmask'
import { getIPClass } from "@/utils/ipv4"

interface SubnetInfo {
  netmask: string
  networkAddress: string
  networkMask: string
  networkMaskBinary: string
  cidrNotation: string
  wildcardMask: string
  networkSize: string
  firstAddress: string
  lastAddress: string
  broadcastAddress: string
  ipClass: string
}

function calculateSubnetDetails(ipWithCidr: string): SubnetInfo {
  try {
    const block = new Netmask(ipWithCidr.trim())

    const binaryMask = ('1'.repeat(block.bitmask) + '0'.repeat(32 - block.bitmask))
      .match(/.{8}/g)?.join('.') ?? ''

    return {
      netmask: block.toString(),
      networkAddress: block.base,
      networkMask: block.mask,
      networkMaskBinary: binaryMask,
      cidrNotation: `/${block.bitmask}`,
      wildcardMask: block.hostmask,
      networkSize: String(block.size),
      firstAddress: block.first,
      lastAddress: block.last,
      broadcastAddress: block.broadcast || '',
      ipClass: getIPClass({ ip: block.base })
    }
  } catch (error) {
    console.error('Invalid IP address format:', error)
    throw error
  }
}

export default function SubnetCalculator() {
  const [ipAddress, setIpAddress] = React.useState("192.168.6.0/24")
  const [subnetInfo, setSubnetInfo] = React.useState<SubnetInfo | null>(null)

  React.useEffect(() => {
    try {
      setSubnetInfo(calculateSubnetDetails(ipAddress))
    } catch {
      setSubnetInfo(null)
    }
  }, [ipAddress])

  const handlePreviousBlock = () => {
    try {
      const block = new Netmask(ipAddress)
      const octets = block.base.split('.').map(Number)
      const size = block.size

      // Calculate the step size for the appropriate octet
      let octetIndex
      if (size >= 16777216) octetIndex = 0        // Class A
      else if (size >= 65536) octetIndex = 1      // Class B
      else if (size >= 256) octetIndex = 2        // Class C
      else octetIndex = 3                         // Host portion

      // Calculate the step size for the target octet
      const stepSize = size / Math.pow(256, 3 - octetIndex)

      // Decrease the appropriate octet
      octets[octetIndex] = Math.max(0, octets[octetIndex] - stepSize)

      // Construct the new IP address
      const previousBase = `${octets.join('.')}/${block.bitmask}`

      try {
        const prev = new Netmask(previousBase)
        setIpAddress(prev.toString())
      } catch {
        // If we hit the network boundary, do nothing
        console.log('Reached network boundary')
      }
    } catch (error) {
      console.error('Could not calculate previous block:', error)
    }
  }

  const handleNextBlock = () => {
    try {
      const block = new Netmask(ipAddress)
      const next = block.next()
      if (next) {
        setIpAddress(next.toString())
      }
    } catch (error) {
      console.error('Could not calculate next block:', error)
    }
  }

  function calculateSubnet(value: string) {
    try {
      const result = calculateSubnetDetails(value)
      setSubnetInfo(result)
    } catch {
      setSubnetInfo(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <div className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-2xl font-bold text-primary">
                <div className="p-2 bg-primary/10 rounded-lg shadow-sm">
                  <Network className="h-5 w-5 text-primary" />
                </div>
                IPv4 Subnet Calculator
              </CardTitle>
              <CardDescription className="mt-2">
                Parse your IPv4 CIDR blocks and get all the info you need about your subnet.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="ipAddress">An IPv4 address with or without mask</Label>
              <Input
                id="ipAddress"
                value={ipAddress}
                onChange={(e) => {
                  setIpAddress(e.target.value)
                  calculateSubnet(e.target.value)
                }}
                className="mt-1"
              />
            </div>

            <div className="space-y-4 bg-muted/50 p-4 rounded-lg">
              {subnetInfo && Object.entries(subnetInfo).map(([key, value]) => (
                <div key={key} className="grid grid-cols-2 gap-4">
                  <div className="font-medium capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</div>
                  <div className="font-mono">{value}</div>
                </div>
              ))}
            </div>

            <div className="flex justify-between">
              <Button variant="secondary" onClick={handlePreviousBlock}>
                ← Previous block
              </Button>
              <Button variant="secondary" onClick={handleNextBlock}>
                Next block →
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

