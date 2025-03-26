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
import { UploadIcon, ArrowDownIcon } from "lucide-react";
import { db } from "../../../../database/firebase";
import { collection, doc, writeBatch, increment } from "firebase/firestore";




interface Bookmark {
  id?: string;
  url: string;
  title: string;
  description: string;
  collection: string;
  tags: string[];
  isFavorite: boolean;
  dateAdded: string;
  visitCount: number;
  lastVisited: string | null;
  favicon: string;
}

interface Collection {
  id: string;
  title: string;
  titleLower?: string; // Add titleLower field for routing
  description: string;
  count: number;
  previewLinks: { title: string; url: string; domain: string; favicon: string }[];
  color: string;
}

interface User {
  uid: string;
  email?: string | null;
  displayName?: string | null;
}

interface BookmarkImporterProps {
  user: User | null;
  userCollections: Collection[];
}

// Utility function to normalize collection names for routing
const normalizeCollectionName = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace one or more spaces with a hyphen
    .replace(/[^a-z0-9-]/g, ""); // Remove any characters that are not alphanumeric or hyphens
};

export default function BookmarkImporter({ user, userCollections }: BookmarkImporterProps) {
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [createCollections, setCreateCollections] = useState(true);
  const [preserveDates, setPreserveDates] = useState(true);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      if (!e.target || typeof e.target.result !== "string") {
        setIsImporting(false);
        alert("Error reading file.");
        return;
      }

      const htmlContent = e.target.result;
      const parser = new DOMParser();
      const docHtml = parser.parseFromString(htmlContent, "text/html");

      const bookmarks: Bookmark[] = [];
      const collectionsMap = new Map<string, { count: number; bookmarks: Bookmark[] }>();

      const processNode = (node: Node, currentCollection = "Bookmarks Bar") => {
        node.childNodes.forEach((child) => {
          if (child.nodeName.toUpperCase() === "A") {
            const element = child as HTMLAnchorElement;
            const url = element.getAttribute("HREF") || "";
            const title = element.textContent || "";
            const addDate = element.getAttribute("ADD_DATE");
            const tags = element.getAttribute("TAGS")?.split(",").filter(Boolean) || [];
            const icon = element.getAttribute("ICON") || "";

            if (url) {
              try {
                new URL(url);
                const bookmark: Bookmark = {
                  url,
                  title: title || new URL(url).hostname,
                  description: "",
                  collection: createCollections ? currentCollection : "Bookmarks Bar", // Use "Bookmarks Bar" as default if createCollections is false
                  tags,
                  isFavorite: false,
                  dateAdded: preserveDates && addDate
                    ? new Date(parseInt(addDate) * 1000).toISOString()
                    : new Date().toISOString(),
                  visitCount: 0,
                  lastVisited: null,
                  favicon: icon || `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}`,
                };

                bookmarks.push(bookmark);

                const collectionData = collectionsMap.get(bookmark.collection) || { count: 0, bookmarks: [] };
                collectionData.count += 1;
                collectionData.bookmarks.push(bookmark);
                collectionsMap.set(bookmark.collection, collectionData);
              } catch (error) {
                console.warn(`Invalid URL skipped: ${url}`, error);
              }
            }
          } else if (child.nodeName.toUpperCase() === "DT") {
            const dtElement = child as HTMLElement;
            const h3Element = dtElement.querySelector("h3");
            if (h3Element && createCollections) {
              const folderName = h3Element.textContent || "Unnamed";
              const dlElement = dtElement.querySelector("dl");
              if (dlElement) {
                processNode(dlElement, folderName);
              }
            } else {
              processNode(child, currentCollection);
            }
          } else if (child.nodeName.toUpperCase() === "DL") {
            processNode(child, currentCollection);
          }
        });
      };

      const rootDl = docHtml.querySelector("dl");
      if (rootDl) {
        processNode(rootDl);
      } else {
        console.error("No root <dl> found in the HTML document.");
      }

      console.log("Parsed bookmarks:", bookmarks);
      console.log("Collections map:", Array.from(collectionsMap.entries()));

      if (bookmarks.length === 0) {
        setIsImporting(false);
        alert("No bookmarks found in the file.");
        return;
      }

      try {
        const batch = writeBatch(db);
        const userBookmarksRef = collection(db, `users/${user.uid}/bookmarks`);
        const userCollectionsRef = collection(db, `users/${user.uid}/collections`);

        // Add bookmarks to Firestore
        bookmarks.forEach((bookmark) => {
          const newDocRef = doc(userBookmarksRef);
          batch.set(newDocRef, bookmark);
        });

        // Handle collections (only if createCollections is true)
        if (createCollections) {
          for (const [title, { count, bookmarks: collectionBookmarks }] of collectionsMap) {
            // Skip Uncategorized for collection creation (if needed)
            // if (title === "Uncategorized") continue;

            const existingCollection = userCollections.find((c) => c.title.toLowerCase() === title.toLowerCase());

            if (existingCollection) {
              const collectionRef = doc(userCollectionsRef, existingCollection.id);
              const updatedPreviewLinks = [
                ...existingCollection.previewLinks,
                ...collectionBookmarks
                  .slice(0, 3 - existingCollection.previewLinks.length)
                  .map((b) => ({
                    title: b.title,
                    url: b.url,
                    domain: new URL(b.url).hostname,
                    favicon: b.favicon,
                  })),
              ].slice(0, 3);

              batch.update(collectionRef, {
                count: increment(count),
                previewLinks: updatedPreviewLinks,
              });
            } else {
              const newCollectionRef = doc(userCollectionsRef);
              const previewLinks = collectionBookmarks.slice(0, 3).map((b) => ({
                title: b.title,
                url: b.url,
                domain: new URL(b.url).hostname,
                favicon: b.favicon,
              }));

              batch.set(newCollectionRef, {
                title, // Original title for display (e.g., "Bookmarks Bar")
                titleLower: normalizeCollectionName(title), // Normalized for routing (e.g., "bookmarks-bar")
                description: `${title} bookmarks`,
                count,
                previewLinks,
                color: `bg-${
                  ["blue", "purple", "green", "amber", "red", "indigo"][
                    Math.floor(Math.random() * 6)
                  ]
                }-500`,
                usageCount: 0,
                isQuickAccess: false,
                createdAt: new Date().toISOString(),
              });
            }
          }
        }

        await batch.commit();
        setIsImporting(false);
        alert(`Successfully imported ${bookmarks.length} bookmarks!`);
        setIsImportDialogOpen(false);
      } catch (error: unknown) {
        console.error("Error adding bookmark: ", error);
        const errorMessage = error instanceof Error ? error.message : "Please try again.";
        alert(`Failed to add bookmark: ${errorMessage}`);
      }
    };
    reader.readAsText(file);
  };

  return (
    <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" aria-label="Import Bookmarks">
          <ArrowDownIcon className="h-4 w-4 mr-2" />
          Import Bookmarks
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Import Bookmarks</DialogTitle>
          <DialogDescription>
            Import bookmarks from your browser or an HTML file.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <h3 className="text-sm font-medium">Import from file</h3>
            <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center">
              {isImporting ? (
                <p className="text-sm text-muted-foreground">Importing bookmarks...</p>
              ) : (
                <>
                  <UploadIcon className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Drag and drop your bookmarks HTML file here
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">or</p>
                  <input
                    type="file"
                    accept=".html"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="fileUpload"
                    disabled={isImporting}
                  />
                  <Button
                    size="sm"
                    onClick={() => document.getElementById("fileUpload")?.click()}
                    disabled={isImporting}
                  >
                    Browse files
                  </Button>
                  <p className="text-xs text-muted-foreground mt-4">
                    Supports exported bookmarks from Chrome, Firefox, Safari, and Edge
                  </p>
                </>
              )}
            </div>
          </div>
          <div className="grid gap-2">
            <h3 className="text-sm font-medium">Import settings</h3>
            <div className="flex items-center space-x-2">
              <Switch
                id="create-collections"
                checked={createCollections}
                onCheckedChange={setCreateCollections}
              />
              <Label htmlFor="create-collections">Create collections from folders</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="preserve-dates"
                checked={preserveDates}
                onCheckedChange={setPreserveDates}
              />
              <Label htmlFor="preserve-dates">Preserve original dates</Label>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => setIsImportDialogOpen(false)} disabled={isImporting}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}