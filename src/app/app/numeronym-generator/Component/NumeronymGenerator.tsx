"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Clipboard, ArrowDown, Hash } from "lucide-react";

export default function NumeronymGenerator() {
  const [word, setWord] = useState<string>("");
  const [numeronym, setNumeronym] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  // Function to generate numeronym
  const generateNumeronym = (input: string) => {
    if (input.length < 3) return input; // If word is too short, return as is
    return `${input[0]}${input.length - 2}${input[input.length - 1]}`;
  };

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setWord(input);
    setNumeronym(generateNumeronym(input));
  };

  // Copy to clipboard function
  const copyToClipboard = () => {
    if (!numeronym) return;
    navigator.clipboard.writeText(numeronym);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500); // Reset after 1.5s
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <div className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-2xl font-bold text-primary">
                <div className="p-2 bg-primary/10 rounded-lg shadow-sm">
                  <Hash className="h-5 w-5 text-primary" />
                </div>
                Numeronym Generator
              </CardTitle>
              <CardDescription className="mt-2">
                A numeronym is a word where a number is used to form an abbreviation. For example, <strong>i18n</strong> is a numeronym of <strong>internationalization</strong> where 18 stands for the number of letters between the first <strong>i</strong> and the last <strong>n</strong>.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <Input
              type="text"
              placeholder="Enter a word, e.g. 'internationalization'"
              value={word}
              onChange={handleChange}
              className="w-full"
            />

            {/* Downward Arrow */}
            <div className="flex justify-center">
              <ArrowDown className="text-muted-foreground" size={24} />
            </div>

            {/* Output Box */}
            <div className="relative flex items-center justify-between p-3 border rounded-lg bg-muted">
              <p className="text-center font-mono max-w-full break-words">
                {numeronym || "Your numeronym will be here, e.g. 'i18n'"}
              </p>

              {/* Copy to Clipboard Button */}
              {numeronym && (
                <Tooltip open={copied}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={copyToClipboard}
                      className="hover:bg-muted-foreground/10"
                    >
                      <Clipboard className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  {copied && <TooltipContent>Copied to clipboard</TooltipContent>}
                </Tooltip>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
