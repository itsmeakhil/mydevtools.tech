"use client";

import { useState, useEffect, useCallback } from "react";
import { Network } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface IPRange {
  startAddress: string;
  endAddress: string;
  newStartAddress: string;
  newEndAddress: string;
  addressCount: number;
  cidr: string;
}

export default function IPv4RangeExpander() {
  const [startAddress, setStartAddress] = useState<string>("192.168.1.1");
  const [endAddress, setEndAddress] = useState<string>("192.168.6.255");
  const [ipRange, setIpRange] = useState<IPRange | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validateIPAddress = (ip: string): boolean => {
    const pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!pattern.test(ip)) return false;
    return ip.split(".").every((segment) => {
      const num = parseInt(segment, 10);
      return num >= 0 && num <= 255;
    });
  };

  const ipToNumber = (ip: string): number => {
    const parts = ip.split(".");
    return (
      (parseInt(parts[0], 10) << 24) +
      (parseInt(parts[1], 10) << 16) +
      (parseInt(parts[2], 10) << 8) +
      parseInt(parts[3], 10)
    ) >>> 0;
  };

  const numberToIp = (num: number): string => {
    return [(num >>> 24) & 255, (num >>> 16) & 255, (num >>> 8) & 255, num & 255].join(".");
  };

  const calculateIPRange = useCallback(() => {
    try {
      if (!validateIPAddress(startAddress) || !validateIPAddress(endAddress)) {
        throw new Error("Invalid IPv4 address format");
      }
  
      const startNum = ipToNumber(startAddress);
      const endNum = ipToNumber(endAddress);
  
      if (startNum > endNum) {
        throw new Error("Start address must be less than or equal to end address");
      }
  
      // Find the smallest power of 2 that covers the entire range
      const rangeSize = endNum - startNum + 1;
      let cidrMask = 32;
      
      // Calculate the appropriate CIDR mask
      while ((1 << (32 - cidrMask)) < rangeSize) {
        cidrMask--;
        if (cidrMask <= 0) {
          throw new Error("Range too large for IPv4 subnet");
        }
      }
  
      // Calculate the network start address using the mask
      const newStartNum = startNum & (0xffffffff << (32 - cidrMask));
      const newEndNum = newStartNum + (1 << (32 - cidrMask)) - 1;
  
      setIpRange({
        startAddress,
        endAddress,
        newStartAddress: numberToIp(newStartNum),
        newEndAddress: numberToIp(newEndNum),
        addressCount: newEndNum - newStartNum + 1,
        cidr: `${numberToIp(newStartNum)}/${cidrMask}`,
      });
  
      setError(null);
    } catch (error) {
      const errMessage = error instanceof Error ? error.message : "An unknown error occurred";
      setError(errMessage);
      setIpRange(null);
    }
  }, [startAddress, endAddress]);

  useEffect(() => {
    calculateIPRange();
  }, [calculateIPRange]);

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
                IPv4 Range Expander
              </CardTitle>
              <CardDescription className="mt-2">
                Given a start and an end IPv4 address, this tool calculates a valid IPv4 subnet along with its CIDR notation.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
              <label htmlFor="start-address" className="text-sm font-medium">
                Start Address
              </label>
              <Input id="start-address" value={startAddress} onChange={(e) => setStartAddress(e.target.value)} placeholder="e.g. 192.168.1.1" />
              </div>
              <div className="space-y-2">
              <label htmlFor="end-address" className="text-sm font-medium">
                End Address
              </label>
              <Input id="end-address" value={endAddress} onChange={(e) => setEndAddress(e.target.value)} placeholder="e.g. 192.168.6.255" />
              </div>
            </div>

            {error && <div className="text-red-500 text-sm text-center">{error}</div>}

            {ipRange && !error && (
              <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]"></TableHead>
                    <TableHead className="text-center">Old Value</TableHead>
                    <TableHead className="text-center">New Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Start Address</TableCell>
                    <TableCell className="text-center font-mono">{ipRange.startAddress}</TableCell>
                    <TableCell className="text-center font-mono">{ipRange.newStartAddress}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">End Address</TableCell>
                    <TableCell className="text-center font-mono">{ipRange.endAddress}</TableCell>
                    <TableCell className="text-center font-mono">{ipRange.newEndAddress}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Addresses in Range</TableCell>
                    <TableCell className="text-center font-mono">
                      {ipToNumber(ipRange.endAddress) - ipToNumber(ipRange.startAddress) + 1}
                    </TableCell>
                    <TableCell className="text-center font-mono">{ipRange.addressCount.toLocaleString()}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">CIDR</TableCell>
                    <TableCell className="text-center"></TableCell>
                    <TableCell className="text-center font-mono">{ipRange.cidr}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}