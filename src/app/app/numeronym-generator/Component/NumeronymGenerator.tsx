"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Clipboard, ArrowDown } from "lucide-react";

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
    <div className="flex flex-col items-center mt-8 min-h-screen p-6 bg-white dark:bg-black">
      <Card className="w-full max-w-2xl max-h-2xl shadow-lg bg-white dark:bg-black text-gray-900 dark:text-white border dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-4xl font-semibold text-center p-2">
            Numeronym Generator
          </CardTitle>
          <p className="text-sm text-gray-700 dark:text-gray-300 text-start">
            A numeronym is a word where a number is used to form an
            abbreviation. For example, <strong>&quot;i18n&quot;</strong> is a
            numeronym of
            <strong>&quot;internationalization&quot;</strong> where 18 stands
            for the number of letters between the first <strong>i</strong> and
            the last <strong>n</strong> in the word.
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Input Box */}
          <Input
            type="text"
            placeholder="Enter a word, e.g. 'internationalization'"
            value={word}
            onChange={handleChange}
            className="w-full text-base p-3 border border-gray-400 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-gray-100 dark:bg-black text-gray-900 dark:text-white"
          />

          {/* Downward Arrow */}
          <div className="flex justify-center">
            <ArrowDown className="text-gray-600 dark:text-gray-300" size={24} />
          </div>

          {/* Output Box */}
          <div className="relative flex items-center justify-between p-3 border border-gray-400 dark:border-gray-600 rounded-lg bg-gray-200 dark:bg-black">
            <p className="text-center font-mono max-w-full break-words text-gray-900 dark:text-gray-300">
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
                    className="text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
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
  );
}
