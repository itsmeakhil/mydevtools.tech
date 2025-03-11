"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { useTheme } from "next-themes";


const API_KEY = "ee810622d3eb68b295a255866d8c6e3ece634a8f";
const API_URL = `https://emoji-api.com/emojis?access_key=${API_KEY}`;

interface Emoji {
  slug: string;
  character: string;
  unicodeName: string;
  codePoint: string;
}

export default function EmojiPicker() {
  const [search, setSearch] = useState<string>("");
  const [emojis, setEmojis] = useState<Emoji[]>([]);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();


  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      fetch(API_URL)
        .then((response) => response.json())
        .then((data: Emoji[]) => {
          if (!Array.isArray(data)) {
            console.error("API did not return an array:", data);
            return;
          }
          setEmojis(data);
        })
        .catch((error) => console.error("Error fetching emojis:", error));
    }
  }, [mounted]);

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
      : (emojis
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
          .map((result) => result!.emoji) as Emoji[]);

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
    <div
      className={`min-h-screen p-4 ${
        theme === "dark" ? "bg-black text-white" : "bg-white text-black"
      }`}
    >
      <div className="w-full max-w-7xl mx-auto space-y-6">
        <h1
          className={`text-2xl font-bold text-center mb-6 ${
            theme === "dark" ? "text-gray-300" : "text-gray-700"
          }`}
        >
          Emoji Picker
        </h1>
        <p
          className={`text-center ${
            theme === "dark" ? "text-white" : "text-black"
          }`}
        >
          Copy and paste emojis easily and get the unicode and code points value
          of each emoji.
        </p>

        <div className="relative mb-8">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={theme === "dark" ? "text-gray-400" : "text-gray-600"}
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          <Input
            placeholder="Search by name, unicode (\\u{...}) or code point (0x...)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`pl-10 py-2 ${
              theme === "dark"
                ? "bg-gray-800 border-black-500 focus:ring-black-500 focus:border-black-500 text-white"
                : "bg-gray-100 border-gray-300 focus:ring-gray-400 focus:border-gray-400 text-black"
            } w-full rounded-md`}
          />
        </div>

        <h2 className="text-xl font-bold mb-4">Search result</h2>

        <div className="grid grid-cols-6 gap-4">
          {filteredEmojis.map((emoji, index) => (
            <div
              key={emoji.codePoint || `emoji-${index}`}
              className={`p-2 rounded-lg flex flex-col items-center text-center ${
                theme === "dark" ? "bg-gray-700" : "bg-gray-100"
              }`} // Changed to bg-gray-700 in dark theme
            >
              <div className="flex flex-col items-center gap-1">
                <span
                  className="text-3xl cursor-pointer mb-1"
                  onClick={() => copyToClipboard(emoji.character)}
                >
                  {emoji.character}
                </span>
                <p
                  className={`text-xs font-medium truncate w-full ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {(emoji.unicodeName || "Emoji")
                    .split(" ")
                    .slice(0, 3)
                    .join(" ")}
                  {(emoji.unicodeName || "").split(" ").length > 3 ? "..." : ""}
                </p>
              </div>
              <div
                className={`text-xs font-mono mt-1 ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                <div className="flex justify-center">
                  <span
                    className={`cursor-pointer ${
                      theme === "dark" ? "hover:text-white" : "hover:text-black"
                    }`}
                    onClick={() =>
                      copyToClipboard(formatCodeDisplay(emoji.codePoint))
                    }
                  >
                    {formatCodeDisplay(emoji.codePoint)}
                  </span>
                </div>
                <div className="flex justify-center">
                  <span
                    className={`cursor-pointer ${
                      theme === "dark" ? "hover:text-white" : "hover:text-black"
                    }`}
                    onClick={() =>
                      copyToClipboard(formatUnicodeDisplay(emoji.codePoint))
                    }
                  >
                    {formatUnicodeDisplay(emoji.codePoint)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredEmojis.length === 0 && (
          <div
            className={`text-center py-10 ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            No emojis found matching {`"${search}"`}
          </div>
        )}

        {copiedText && (
          <div className="fixed bottom-4 text-center transform -translate-x-1/2 bg-white-500 text-black dark: bg-black text-white px-4 py-2 rounded-md shadow-lg">
            Copied: {copiedText}
          </div>
        )}
      </div>
    </div>
  );
}
