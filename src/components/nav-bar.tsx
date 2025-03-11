"use client";

import { useState, useEffect, useRef, KeyboardEvent as ReactKeyboardEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UrlObject } from "url";
import { Github, Home, Search, X, ArrowUp, ArrowDown } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ModeToggle } from "./modeToggle";
import { sidebarData } from "../components/sidebar/data/sidebar-data";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";


// Define types for our search functionality
interface SearchItem {
  title: string;
  description?: string;
  url?: string | UrlObject;
  icon?: React.ElementType; 
  type: "tool" | "page";
}

export function NavBar() {
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const resultRefs = useRef<Array<HTMLAnchorElement | null>>([]);

  // Prepare search data from sidebar data
  const searchData: SearchItem[] = [];

  // Extract all searchable items from sidebar data
  sidebarData.navGroups.forEach((group) => {
    group.items.forEach((item) => {
      if (!item.items) {
        // Add top-level item
        searchData.push({
          title: item.title,
          description: item.description || "",
          url: item.url,
          icon: item.icon,
          type: "tool",
        });
      } else {
        // Add parent as a category
        searchData.push({
          title: item.title,
          type: "page",
        });

        // Add all child items
        item.items.forEach((subItem) => {
          searchData.push({
            title: subItem.title,
            description: subItem.description || "",
            url: subItem.url,
            icon: item.icon, // Use parent icon for subitems
            type: "tool",
          });
        });
      }
    });
  });

  // Add About page as searchable
  searchData.push({
    title: "About",
    description: "Learn more about IT-Tools.",
    url: "/about",
    type: "page",
  });

  // Reset selection when search results change
  useEffect(() => {
    setSelectedIndex(-1);
    resultRefs.current = resultRefs.current.slice(0, searchResults.length);
  }, [searchResults]);

  // Auto-focus search input when dialog opens
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Function to handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);

    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const results = searchData.filter(
      (item) =>
        item.title.toLowerCase().includes(lowerQuery) ||
        (item.description && item.description.toLowerCase().includes(lowerQuery))
    );

    // Group results by type
    const tools = results.filter((item) => item.type === "tool");
    const pages = results.filter((item) => item.type === "page");

    setSearchResults([...tools, ...pages]);
  };

  // Function to close search modal
  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery("");
    setSearchResults([]);
    setSelectedIndex(-1);
  };

  // Handle keyboard events for navigation
  const handleKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    // Navigate through results
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prevIndex) => {
        const newIndex = prevIndex < searchResults.length - 1 ? prevIndex + 1 : 0;
        resultRefs.current[newIndex]?.scrollIntoView({ block: "nearest" });
        return newIndex;
      });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prevIndex) => {
        const newIndex = prevIndex > 0 ? prevIndex - 1 : searchResults.length - 1;
        resultRefs.current[newIndex]?.scrollIntoView({ block: "nearest" });
        return newIndex;
      });
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
        const selectedItem = searchResults[selectedIndex];
        if (selectedItem.url) {
          router.push(selectedItem.url.toString());
          closeSearch();
        }
      } else if (searchResults.length > 0) {
        // If nothing is selected but there are results, navigate to first result
        const firstItem = searchResults[0];
        if (firstItem.url) {
          router.push(firstItem.url.toString());
          closeSearch();
        }
      }
    } else if (e.key === "Escape") {
      closeSearch();
    }
  };

  // Function to handle item click or selection
  const handleItemSelect = (item: SearchItem) => {
    if (item.url) {
      router.push(item.url.toString());
      closeSearch();
    }
  };

  // Listen for Ctrl+K to open search
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  // Function to set ref properly without returning a value
  const setResultRef = (index: number) => (element: HTMLAnchorElement | null) => {
    resultRefs.current[index] = element;
  };

  // Filter results for different sections
  const toolResults = searchResults.filter((item) => item.type === "tool");
  const pageResults = searchResults.filter((item) => item.type === "page");

  return (
    <>
      <header className="sticky top-0 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-20">
        <div className="flex h-14 items-center pr-4 pl-4">
          <div className="flex items-center gap-2 md:gap-4">
            <SidebarTrigger className="h-8 w-8 md:h-9 md:w-9" />
            <Button
              variant="ghost"
              size="icon"
              className="hidden h-10 w-10 md:flex md:h-11 md:w-11"
              asChild
            >
              <Link href="/dashboard">
                <Home className="h-6 w-6 md:h-7 md:w-7" />
                <span className="sr-only">Home</span>
              </Link>
            </Button>
          </div>

          <div className="flex flex-1 items-center justify-center px-2">
            <div className="w-full max-w-2xl">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tools... (Ctrl+K)"
                  className="pl-8 sm:w-[300px] md:w-[400px] lg:w-[500px] cursor-pointer"
                  readOnly
                  onClick={() => setIsSearchOpen(true)}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 md:h-9 md:w-9"
              asChild
            >
              <Link
                href="https://github.com/itsmeakhil/mydevtools.tech"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="h-4 w-4 md:h-5 md:w-5" />
                <span className="sr-only">GitHub</span>
              </Link>
            </Button>
            <ModeToggle />
          </div>
        </div>
      </header>

      {/* Search Dialog */}
      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogContent className="sm:max-w-[600px] p-0 shadow-lg rounded-xl">
          <DialogTitle className="p-4 text-xl font-bold border-b bg-background/90">
            Search Tools & Pages
          </DialogTitle>

          {/* Search Input */}
          <div className="relative border-b p-4">
            <Search className="absolute left-5 top-[22px] h-5 w-5 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              placeholder="Type to search..."
              className="border-0 rounded-md pl-12 pr-12 h-12 text-base focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all duration-200"
              autoFocus
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-5 top-[18px] h-8 w-8 hover:bg-muted/60"
                onClick={() => {
                  setSearchQuery("");
                  setSearchResults([]);
                  searchInputRef.current?.focus();
                }}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Clear search</span>
              </Button>
            )}
          </div>

          {/* Search Results */}
          <div className="overflow-y-auto max-h-[calc(80vh-130px)] p-4 space-y-3">
            {searchQuery && searchResults.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
              No results found for &quot;
              <span className="font-bold">{searchQuery}</span>
              &quot;
            </div>
            ) : (
              <>
                {/* Keyboard Navigation Instructions */}
                {searchResults.length > 0 && (
                  <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground mb-2 bg-muted/30 py-2 rounded-md">
                    <div className="flex items-center gap-1">
                      <ArrowUp className="h-3 w-3" />
                      <ArrowDown className="h-3 w-3" />
                      <span>to navigate</span>
                    </div>
                    <div>
                      <span className="px-1 py-0.5 bg-muted/70 rounded border">Enter</span>
                      <span className="ml-1">to select</span>
                    </div>
                  </div>
                )}

                {/* Tools Section */}
                {toolResults.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-2">
                      Tools
                    </h3>
                    <div className="space-y-2">
                      {toolResults.map((result, index) => {
                        // Calculate the index in the combined results array
                        const combinedIndex = index;
                        return (
                          <a
                            key={`${result.title}-${index}`}
                            ref={setResultRef(combinedIndex)}
                            href={result.url ? result.url.toString() : "#"}
                            onClick={(e) => {
                              e.preventDefault();
                              handleItemSelect(result);
                            }}
                            className={`flex items-center gap-3 p-3 rounded-md transition-all cursor-pointer ${
                              selectedIndex === combinedIndex
                                ? "bg-primary/10 text-primary font-semibold ring-1 ring-primary"
                                : "bg-muted/50 hover:bg-muted/70"
                            }`}
                            aria-selected={selectedIndex === combinedIndex}
                          >
                            {result.icon && (
                              <result.icon className={`h-5 w-5 ${
                                selectedIndex === combinedIndex
                                  ? "text-primary"
                                  : "text-muted-foreground"
                              }`} />
                            )}
                            <div>
                              <div className="font-medium">{result.title}</div>
                              {result.description && (
                                <div className={`text-sm ${
                                  selectedIndex === combinedIndex
                                    ? "text-primary/80"
                                    : "text-muted-foreground"
                                }`}>
                                  {result.description}
                                </div>
                              )}
                            </div>
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Pages Section */}
                {pageResults.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase mt-4 mb-2">
                      Pages
                    </h3>
                    <div className="space-y-2">
                      {pageResults.map((result, index) => {
                        // Calculate the index in the combined results array
                        const combinedIndex = toolResults.length + index;
                        return (
                          <a
                            key={`${result.title}-${index}`}
                            ref={setResultRef(combinedIndex)}
                            href={result.url ? result.url.toString() : "#"}
                            onClick={(e) => {
                              e.preventDefault();
                              handleItemSelect(result);
                            }}
                            className={`flex items-center gap-3 p-3 rounded-md transition-all cursor-pointer ${
                              selectedIndex === combinedIndex
                                ? "bg-primary/10 text-primary font-semibold ring-1 ring-primary"
                                : "bg-muted/50 hover:bg-muted/70"
                            }`}
                            aria-selected={selectedIndex === combinedIndex}
                          >
                            <div className="font-medium">{result.title}</div>
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Keyboard shortcuts footer */}
          {searchResults.length > 0 && (
            <div className="border-t p-3 text-xs text-center text-muted-foreground">
              Press <kbd className="px-1.5 py-0.5 bg-muted rounded border mx-1">Esc</kbd> to close search
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}