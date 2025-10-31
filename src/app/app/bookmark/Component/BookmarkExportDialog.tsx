"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { DownloadIcon, FileDownIcon } from "lucide-react";

interface Bookmark {
  id: string;
  url: string;
  title: string;
  description: string;
  collection: string;
  tags: string[];
  isFavorite: boolean;
  dateAdded: string | any; // Can be string or Timestamp
  visitCount: number;
  lastVisited?: string | null;
  favicon: string;
}

interface User {
  uid: string;
  email?: string | null;
  displayName?: string | null;
}

interface BookmarkExporterProps {
  user: User | null;
  bookmarks: Bookmark[];
}

export default function BookmarkExporter({ user, bookmarks }: BookmarkExporterProps) {
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [includeUncategorized, setIncludeUncategorized] = useState(true);
  const [groupByCollection, setGroupByCollection] = useState(true);

  const exportToHTML = () => {
    if (!user || bookmarks.length === 0) {
      alert("No bookmarks to export.");
      return;
    }

    setIsExporting(true);

    try {
      // Create the HTML structure
      let html = '<!DOCTYPE NETSCAPE-Bookmark-file-1>\n';
      html += '<!-- This is an automatically generated file.\n';
      html += '     It will be read and overwritten.\n';
      html += '     DO NOT EDIT! -->\n';
      html += '<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">\n';
      html += '<TITLE>Bookmarks</TITLE>\n';
      html += '<H1>Bookmarks</H1>\n';
      html += '<DL><p>\n';

      // Group bookmarks by collection if enabled
      if (groupByCollection) {
        const collections = new Map<string, Bookmark[]>();

        bookmarks.forEach((bookmark) => {
          const collection = bookmark.collection || "Uncategorized";
          if (collection === "Uncategorized" && !includeUncategorized) {
            return; // Skip uncategorized if not included
          }

          if (!collections.has(collection)) {
            collections.set(collection, []);
          }
          collections.get(collection)!.push(bookmark);
        });

        // Generate HTML for each collection
        collections.forEach((collectionBookmarks, collectionName) => {
          if (collectionName !== "Uncategorized") {
            // Convert date to Unix timestamp
            const now = Math.floor(Date.now() / 1000);
            html += `    <DT><H3 ADD_DATE="${now}" LAST_MODIFIED="${now}">${collectionName}</H3>\n`;
            html += '    <DL><p>\n';

            collectionBookmarks.forEach((bookmark) => {
              html += generateBookmarkHTML(bookmark);
            });

            html += '    </DL><p>\n';
          }
        });

        // Add uncategorized bookmarks if enabled
        if (includeUncategorized && collections.has("Uncategorized")) {
          const uncategorizedBookmarks = collections.get("Uncategorized")!;
          uncategorizedBookmarks.forEach((bookmark) => {
            html += generateBookmarkHTML(bookmark);
          });
        }
      } else {
        // Add all bookmarks without grouping
        bookmarks.forEach((bookmark) => {
          if (bookmark.collection === "Uncategorized" && !includeUncategorized) {
            return; // Skip uncategorized if not included
          }
          html += generateBookmarkHTML(bookmark);
        });
      }

      html += '</DL><p>\n';

      // Create a blob and download it
      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `bookmarks_${new Date().toISOString().split("T")[0]}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setIsExporting(false);
      alert(`Successfully exported ${bookmarks.length} bookmarks!`);
      setIsExportDialogOpen(false);
    } catch (error) {
      console.error("Error exporting bookmarks: ", error);
      alert("Failed to export bookmarks. Please try again.");
      setIsExporting(false);
    }
  };

  const generateBookmarkHTML = (bookmark: Bookmark): string => {
    let addDate = Math.floor(Date.now() / 1000);
    if (bookmark.dateAdded) {
      // Handle both string and Timestamp objects
      const date = typeof bookmark.dateAdded === 'string' 
        ? new Date(bookmark.dateAdded) 
        : bookmark.dateAdded.toDate ? bookmark.dateAdded.toDate() : new Date(bookmark.dateAdded);
      addDate = Math.floor(date.getTime() / 1000);
    }
    const tags = bookmark.tags.length > 0 ? ` TAGS="${bookmark.tags.join(",")}"` : "";
    const icon = bookmark.favicon ? ` ICON="${bookmark.favicon}"` : "";
    
    return `    <DT><A HREF="${escapeXml(bookmark.url)}" ADD_DATE="${addDate}"${icon}${tags}>${escapeXml(bookmark.title)}</A>\n`;
  };

  const escapeXml = (unsafe: string): string => {
    return unsafe.replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case "<":
          return "&lt;";
        case ">":
          return "&gt;";
        case "&":
          return "&amp;";
        case "'":
          return "&apos;";
        case '"':
          return "&quot;";
        default:
          return c;
      }
    });
  };

  return (
    <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" aria-label="Export Bookmarks" disabled={!user || bookmarks.length === 0}>
          <DownloadIcon className="h-4 w-4 mr-2" />
          Export Bookmarks
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Export Bookmarks</DialogTitle>
          <DialogDescription>
            Export your bookmarks to an HTML file that can be imported into any browser.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <h3 className="text-sm font-medium">Export settings</h3>
            <div className="flex items-center space-x-2">
              <Switch
                id="group-by-collection"
                checked={groupByCollection}
                onCheckedChange={setGroupByCollection}
              />
              <Label htmlFor="group-by-collection">Group by collection</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="include-uncategorized"
                checked={includeUncategorized}
                onCheckedChange={setIncludeUncategorized}
              />
              <Label htmlFor="include-uncategorized">Include uncategorized bookmarks</Label>
            </div>
          </div>
          <div className="border rounded-lg p-4 bg-muted/50">
            <div className="flex items-center gap-3">
              <FileDownIcon className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm font-medium">Ready to export</p>
                <p className="text-xs text-muted-foreground">
                  {bookmarks.length} {bookmarks.length === 1 ? "bookmark" : "bookmarks"} will be exported
                </p>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => setIsExportDialogOpen(false)} disabled={isExporting} variant="outline">
            Cancel
          </Button>
          <Button onClick={exportToHTML} disabled={isExporting}>
            {isExporting ? "Exporting..." : "Export Bookmarks"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

