"use client";

import { useEffect, useState } from "react";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreVertical, ExternalLink } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { db, auth } from "../../../../database/firebase"; // Adjust path to your firebase.ts file
import { collection, query, orderBy, getDocs } from "firebase/firestore";

interface Bookmark {
  id: string;
  title: string;
  description?: string;
  url: string;
  tags: string[];
  collection: string;
  createdAt: string;
}

interface BookmarksListProps {
  type?: "recent" | "favorites" | "popular";
}

export function BookmarksList({ type = "recent" }: BookmarksListProps) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  useEffect(() => {
    const fetchBookmarks = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const bookmarksRef = collection(db, "users", user.uid, "bookmarks");
      let q;

      switch (type) {
        case "recent":
          q = query(bookmarksRef, orderBy("createdAt", "desc"));
          break;
        case "favorites":
          // Add logic for favorites (e.g., a 'favorite' field in Firestore)
          q = query(bookmarksRef, orderBy("createdAt", "desc")); // Placeholder
          break;
        case "popular":
          // Add logic for popular (e.g., based on click count or tags)
          q = query(bookmarksRef, orderBy("createdAt", "desc")); // Placeholder
          break;
        default:
          q = query(bookmarksRef, orderBy("createdAt", "desc"));
      }

      const querySnapshot = await getDocs(q);
      const fetchedBookmarks = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Bookmark[];
      setBookmarks(fetchedBookmarks);
    };

    fetchBookmarks();
  }, [type]);

  return (
    <div className="space-y-4">
      {bookmarks.length === 0 ? (
        <p>No bookmarks found.</p>
      ) : (
        bookmarks.map((bookmark) => (
          <Card key={bookmark.id} className="overflow-hidden">
            <div className="flex justify-between items-start p-6">
              <div className="space-y-1.5">
                <CardTitle className="text-xl">{bookmark.title}</CardTitle>
                <CardDescription>{bookmark.description || "No description"}</CardDescription>
                <div className="flex flex-wrap gap-2 pt-2">
                  {bookmark.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" asChild>
                  <a href={bookmark.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                    <span className="sr-only">Open link</span>
                  </a>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">More options</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                    <DropdownMenuItem>Add to collection</DropdownMenuItem>
                    <DropdownMenuItem>Copy URL</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}