"use client";

import type React from "react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Heart, X, Clipboard } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface VendorInfo {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export default function MacAddressLookup() {
  const [macAddress, setMacAddress] = useState("20:37:06:12:34:56");
  const [isFavorite, setIsFavorite] = useState(false);
  const [vendorInfo, setVendorInfo] = useState<VendorInfo | null>({
    name: "Cisco Systems, Inc",
    address: "80 West Tasman Drive",
    city: "San Jose",
    state: "CA",
    zip: "94568",
    country: "United States",
  });
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleMacAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMacAddress(value);
    setError(null); // Reset error on change
  };

  const clearMacAddress = () => {
    setMacAddress("");
    setVendorInfo(null);
    setError("Invalid MAC address");
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const copyVendorInfo = () => {
    if (!vendorInfo) return;

    const text = `${vendorInfo.name}
${vendorInfo.address}
${vendorInfo.city}, ${vendorInfo.state} ${vendorInfo.zip}
${vendorInfo.country}`;

    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Vendor information has been copied to your clipboard.",
      duration: 3000,
    });
  };

  const lookupMacAddress = async () => {
    if (!/^[0-9A-Fa-f]{2}([-:])[0-9A-Fa-f]{2}(\1[0-9A-Fa-f]{2}){4}$/.test(macAddress)) {
      setVendorInfo(null);
      setError("Invalid MAC address");
      return;
    }
  
    try {
      // Fetch the OUI JSON file
      const response = await fetch("/oui.json"); 
      if (!response.ok) {
        throw new Error("Failed to load OUI data");
      }
      
      const ouiData = await response.json();
      
      // Extract the first 6 characters (OUI) from the MAC address
      const formattedMac = macAddress.replace(/[-:]/g, "").toUpperCase();
      const ouiPrefix = formattedMac.substring(0, 6);
  
      // Look for the vendor
      const vendorName = ouiData[ouiPrefix] || "Unknown Vendor";
  
      setVendorInfo({
        name: vendorName,
        address: "Unknown Address",
        city: "Unknown City",
        state: "Unknown State",
        zip: "00000",
        country: "Unknown Country",
      });
  
      setError(null);
    } catch (error) {
      console.error(error);
      setVendorInfo(null);
      setError("Error fetching OUI data");
    }
  };
  

  return (
    <div className="flex justify-center items-center p-4 w-full">
      <Card className="w-full max-w-md border shadow-sm">
        <CardHeader className="relative">
          <div className="absolute right-6 top-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFavorite}
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart className={`h-5 w-5 ${isFavorite ? "fill-primary text-primary" : "text-muted-foreground"}`} />
            </Button>
          </div>
          <CardTitle className="text-3xl text-center">MAC address lookup</CardTitle>
          <CardDescription className="text-center">
            Find the vendor and manufacturer of a device by its MAC address.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mac-address">MAC address:</Label>
            <div className="relative">
              <Input
                id="mac-address"
                value={macAddress}
                onChange={handleMacAddressChange}
                onBlur={lookupMacAddress}
                className={`pr-10 ${error ? "border-red-500" : ""}`}
                placeholder="XX:XX:XX:XX:XX:XX"
              />
              {macAddress && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={clearMacAddress}
                  aria-label="Clear MAC address"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>

          {vendorInfo ? (
            <div className="space-y-2">
              <Label>Vendor info:</Label>
              <div className="rounded-md bg-muted p-4 text-sm">
                <p className="font-medium">{vendorInfo.name}</p>
                <p>{vendorInfo.address}</p>
                <p>
                  {vendorInfo.city}, {vendorInfo.state} {vendorInfo.zip}
                </p>
                <p>{vendorInfo.country}</p>
              </div>
            </div>
          ) : (
            <div className="rounded-md bg-muted p-4 text-sm italic text-blue-400">Unknown vendor for this address</div>
          )}
        </CardContent>
        {vendorInfo && (
          <CardFooter className="flex justify-end">
            <Button variant="secondary" onClick={copyVendorInfo} className="flex items-center gap-2">
              <Clipboard className="h-4 w-4" />
              Copy vendor info
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
