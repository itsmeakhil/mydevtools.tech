"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Copy, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function StringObfuscator() {
  const [inputText, setInputText] = useState("Lorem ipsum dolor sit amet");
  const [keepFirst, setKeepFirst] = useState(4);
  const [keepLast, setKeepLast] = useState(4);
  const [keepSpaces, setKeepSpaces] = useState(true);
  const [obfuscatedText, setObfuscatedText] = useState("");
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const obfuscateString = () => {
      if (!inputText) {
        setObfuscatedText("");
        return;
      }
      const visibleStart = inputText.slice(0, keepFirst);
      const visibleEnd = inputText.slice(-keepLast);
      const masked = inputText
        .slice(keepFirst, -keepLast)
        .replace(/\S/g, "*")
        .replace(/ /g, keepSpaces ? " " : "*");
      setObfuscatedText(visibleStart + masked + visibleEnd);
    };
    obfuscateString();
  }, [inputText, keepFirst, keepLast, keepSpaces]);

  const handleCopy = () => {
    navigator.clipboard.writeText(obfuscatedText);
    setShowTooltip(true);
    setTimeout(() => setShowTooltip(false), 1500); // Hide after 1.5 sec
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <div className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-2xl font-bold text-primary">
                <div className="p-2 bg-primary/10 rounded-lg shadow-sm">
                  <Lock className="h-5 w-5 text-primary" />
                </div>
                String Obfuscator
              </CardTitle>
              <CardDescription className="mt-2">
                Obfuscate sensitive strings while keeping some parts visible.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>String to obfuscate:</Label>
              <Input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Keep first:</Label>
                <Input
                  type="number"
                  value={keepFirst}
                  onChange={(e) => setKeepFirst(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label>Keep last:</Label>
                <Input
                  type="number"
                  value={keepLast}
                  onChange={(e) => setKeepLast(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label>Keep spaces:</Label>
              <Switch checked={keepSpaces} onCheckedChange={setKeepSpaces} />
            </div>
            {obfuscatedText && (
              <div className="relative p-3 border rounded bg-muted flex items-center justify-between">
                <p className="text-center font-mono overflow-auto max-w-full break-words">
                  {obfuscatedText}
                </p>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopy}
                  className="hover:bg-muted-foreground/10"
                >
                  <Copy className="w-4 h-4" />
                </Button>

                {showTooltip && (
                  <div className="absolute bottom-[-30px] left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground text-md px-2 py-1 rounded shadow-md">
                    Copied to clipboard!
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
