"use client";

import { useState, useEffect, useCallback } from "react";
import { Heart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";

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
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
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
    <div className="flex justify-center items-center p-4 w-full">
      <Card className="w-full max-w-3xl border shadow-sm">
        <CardHeader className="relative">
          <div className="absolute right-6 top-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFavorite(!isFavorite)}
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart className={cn("h-6 w-6", isFavorite ? "fill-primary text-primary" : "text-muted-foreground")} />
            </Button>
          </div>
          <div className="text-center">
            <CardTitle className="text-3xl font-bold">IPv4 Range Expander</CardTitle>
            <CardDescription className="mt-2 max-w-xl mx-auto">
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
  );
}