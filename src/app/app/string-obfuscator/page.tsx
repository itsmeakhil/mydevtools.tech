"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    <div className="flex flex-col items-center min-h-screen p-8 mt-4">
      <Card className="w-full max-w-xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">String Obfuscator</CardTitle>
          <p className="text-sm text-muted-foreground">
            Obfuscate sensitive strings while keeping some parts visible.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3">
            <label className="text-sm font-medium">String to obfuscate:</label>
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full text-base"
            />
          </div>
          <div className="flex justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm">Keep first:</span>
              <Input
                type="number"
                value={keepFirst}
                onChange={(e) => setKeepFirst(Number(e.target.value))}
                className="w-16 text-center"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">Keep last:</span>
              <Input
                type="number"
                value={keepLast}
                onChange={(e) => setKeepLast(Number(e.target.value))}
                className="w-16 text-center"
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Keep spaces:</span>
            <Switch checked={keepSpaces} onCheckedChange={setKeepSpaces} />
          </div>
          {obfuscatedText && (
            <div className="relative mt-4 p-3 border rounded bg-muted flex items-center justify-between">
              <p className="text-center font-mono overflow-auto max-w-full break-words">
                {obfuscatedText}
              </p>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopy}
                className="hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
              >
                <Copy className="w-4 h-4" />
              </Button>

              {showTooltip && (
                <div className="absolute bottom-[-30px] left-1/2 transform -translate-x-1/2 bg-black text-white text-md px-2 py-1 rounded shadow-md">
                  Copied to clipboard!
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
