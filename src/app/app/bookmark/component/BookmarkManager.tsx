"use client";

import { useState, useEffect } from "react";
import { BookmarksList } from "./BookmarkList";
import { StatsCards } from "./stats-card";
import { PopularTags } from "./popular-tags";
import { CollectionsSection } from "./collection-section";
import { AddBookmarkDialog } from "./add-bookmark-dialog";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../../components/ui/tab";
import { auth } from "../../../../database/firebase"; // Adjust path to your firebase.ts file
import { onAuthStateChanged, User } from "firebase/auth"; // Import Firebase's User type

export function BookmarksManager() {
  const [isAddBookmarkOpen, setIsAddBookmarkOpen] = useState(false);
  const [showStatsCards] = useState(true); // Removed setShowStatsCards since it's unused
  const [user, setUser] = useState<User | null>(null); // Use Firebase's User type

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // No type mismatch now
    });
    return () => unsubscribe();
  }, []);

  if (!user) {
    return <div>Please log in to manage your bookmarks.</div>;
  }

  return (
    <div className="w-full max-w-full">
      <div className="p-2">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="relative w-full sm:w-auto flex-1 max-w-md">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search bookmarks..."
                className="pl-8 w-full"
              />
            </div>
            <Button onClick={() => setIsAddBookmarkOpen(true)}>
              Add Bookmark
            </Button>
          </div>

          {showStatsCards && <StatsCards />}

          <Tabs
            defaultValue="recent"
            className="w-full"
          >
            <TabsList className="w-full max-w-xl">
              <TabsTrigger value="recent" className="flex-1">
                Recent
              </TabsTrigger>
              <TabsTrigger value="favorites" className="flex-1">
                Favorites
              </TabsTrigger>
              <TabsTrigger value="popular" className="flex-1">
                Popular
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="recent"
              className="mt-4 space-y-4 w-full"
            >
              <div className="w-full">
                <BookmarksList />
                <PopularTags />
                <CollectionsSection />
              </div>
            </TabsContent>

            <TabsContent value="favorites" className="mt-4 space-y-4">
              <BookmarksList type="favorites" />
            </TabsContent>

            <TabsContent value="popular" className="mt-4 space-y-4">
              <BookmarksList type="popular" />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <AddBookmarkDialog
        open={isAddBookmarkOpen}
        onOpenChange={setIsAddBookmarkOpen}
      />
    </div>
  );
}