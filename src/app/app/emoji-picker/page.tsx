"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useTheme } from "next-themes";
import { Smile } from "lucide-react";
import localEmojis from "./emojis.json"; // Import the local emoji data

// Emoji interface definition
interface Emoji {
  slug: string;
  character: string;
  unicodeName: string;
  codePoint: string;
}

export default function EmojiPicker() {
  const [search, setSearch] = useState<string>("");
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();

  // Use localEmojis directly (no need for useState)
  const emojis = localEmojis as Emoji[];

  useEffect(() => {
    setMounted(true);
  }, []);

  const getSimilarityScore = (str1: string, str2: string): number => {
    const cleanStr1 = str1.toLowerCase().replace(/[^a-z0-9]/g, "");
    const cleanStr2 = str2.toLowerCase().replace(/[^a-z0-9]/g, "");

    if (cleanStr1 === cleanStr2) return 1;
    if (cleanStr1.length === 0 || cleanStr2.length === 0) return 0;

    const matches = Array.from(cleanStr1).reduce((acc, char, i) => {
      return cleanStr2[i] === char ? acc + 1 : acc;
    }, 0);

    return matches / Math.max(cleanStr1.length, cleanStr2.length);
  };

  const filteredEmojis =
    search.trim() === ""
      ? emojis
      : emojis
          .map((emoji) => {
            if (!emoji) return null;

            const searchClean = search
              .toLowerCase()
              .replace("0x", "")
              .replace("\\u", "")
              .replace("{", "")
              .replace("}", "");
            const name = (emoji.unicodeName || "").toLowerCase();
            const code = (emoji.codePoint || "").toLowerCase();

            const nameScore = getSimilarityScore(searchClean, name);
            const codeScore = getSimilarityScore(searchClean, code);
            const exactMatch =
              name.includes(searchClean) || code === searchClean;

            return {
              emoji,
              score: Math.max(nameScore, codeScore),
              isExact: exactMatch,
            };
          })
          .filter(
            (result) =>
              result !== null && (result.score > 0.3 || result.isExact)
          )
          .sort((a, b) => {
            if (a!.isExact && !b!.isExact) return -1;
            if (!a!.isExact && b!.isExact) return 1;
            return b!.score - a!.score;
          })
          .map((result) => result!.emoji);

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopiedText(text);
        setTimeout(() => setCopiedText(null), 1500);
      })
      .catch((error) => {
        console.error("Failed to copy text: ", error);
      });
  };

  const formatCodeDisplay = (code: string) => {
    return code ? `0x${code}` : "0x";
  };

  const formatUnicodeDisplay = (codePoint: string) => {
    return codePoint ? `\\u{${codePoint}}` : "\\u{unknown}";
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <div className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-2xl font-bold text-primary">
                <div className="p-2 bg-primary/10 rounded-lg shadow-sm">
                  <Smile className="h-5 w-5 text-primary" />
                </div>
                Emoji Picker
              </CardTitle>
              <CardDescription className="mt-2">
                Copy and paste emojis easily and get the unicode and code points value
                of each emoji.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Input
                placeholder="Search by name, unicode (\\u{...}) or code point (0x...)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full"
              />

              <h2 className="text-xl font-bold">
                {search.trim() !== "" ? "Search results" : "All emojis"}
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {filteredEmojis.map((emoji, index) => (
                  <div
                    key={`${emoji.codePoint}-${index}`}
                    className="p-2 rounded-lg flex flex-col items-center text-center bg-muted hover:bg-muted/80 transition-colors"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span
                        className="text-3xl cursor-pointer mb-1"
                        onClick={() => copyToClipboard(emoji.character)}
                        title="Click to copy emoji"
                      >
                        {emoji.character}
                      </span>
                      <p className="text-xs font-medium truncate w-full text-muted-foreground">
                        {(emoji.unicodeName || "Emoji")
                          .split(" ")
                          .slice(0, 3)
                          .join(" ")}
                        {(emoji.unicodeName || "").split(" ").length > 3 ? "..." : ""}
                      </p>
                    </div>
                    <div className="text-xs font-mono mt-1 text-muted-foreground">
                      <div className="flex justify-center">
                        <span
                          className="cursor-pointer hover:text-primary"
                          onClick={() =>
                            copyToClipboard(formatCodeDisplay(emoji.codePoint))
                          }
                          title="Click to copy code point"
                        >
                          {formatCodeDisplay(emoji.codePoint)}
                        </span>
                      </div>
                      <div className="flex justify-center">
                        <span
                          className="cursor-pointer hover:text-primary"
                          onClick={() =>
                            copyToClipboard(formatUnicodeDisplay(emoji.codePoint))
                          }
                          title="Click to copy unicode"
                        >
                          {formatUnicodeDisplay(emoji.codePoint)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {filteredEmojis.length === 0 && (
              <div className="text-center py-10 text-muted-foreground">
                No emojis found matching &quot;{search}&quot;
              </div>
            )}
          </CardContent>
        </Card>

        {copiedText && (
          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-md shadow-lg z-50">
            Copied: {copiedText}
          </div>
        )}
      </div>
    </div>
  );
}