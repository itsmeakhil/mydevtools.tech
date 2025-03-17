"use client";

import { useState, useEffect } from "react";
import { Bookmark, FolderClosed, Tag, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db, auth } from "../../../../database/firebase"; // Adjust path to your firebase.ts file
import { collection, query, where, onSnapshot } from "firebase/firestore";

export function StatsCards() {
  const [stats, setStats] = useState({
    totalBookmarks: 247, // Initial values matching your original UI
    collectionsCount: 15,
    tagsCount: 32,
    recentActivity: 18,
    bookmarksChange: 12, // For "+12 from last week"
  });

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const bookmarksRef = collection(db, "users", user.uid, "bookmarks");
    const q = query(bookmarksRef, where("uid", "==", user.uid));

    // Real-time listener for bookmark data
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const bookmarks = snapshot.docs.map((doc) => doc.data());

      // Calculate stats
      const totalBookmarks = bookmarks.length;

      // Unique collections
      const collections = new Set(bookmarks.map((b) => b.collection));
      const collectionsCount = collections.size;

      // Unique tags
      const allTags = bookmarks.flatMap((b) => b.tags || []);
      const uniqueTags = new Set(allTags);
      const tagsCount = uniqueTags.size;

      // Recent activity (bookmarks added in the last 7 days)
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const recentActivity = bookmarks.filter(
        (b) => new Date(b.createdAt) > oneWeekAgo
      ).length;

      // Bookmarks change from last week (approximation)
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
      const lastWeekBookmarks = bookmarks.filter(
        (b) => new Date(b.createdAt) > twoWeeksAgo && new Date(b.createdAt) <= oneWeekAgo
      ).length;
      const bookmarksChange = recentActivity - lastWeekBookmarks;

      setStats({
        totalBookmarks,
        collectionsCount,
        tagsCount,
        recentActivity,
        bookmarksChange,
      });
    }, (error) => {
      console.error("Error fetching bookmarks:", error);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Bookmarks</CardTitle>
          <Bookmark className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalBookmarks}</div>
          <CardDescription className="text-xs text-muted-foreground">
            {stats.bookmarksChange >= 0
              ? `+${stats.bookmarksChange} from last week`
              : `${stats.bookmarksChange} from last week`}
          </CardDescription>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Collections</CardTitle>
          <FolderClosed className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.collectionsCount}</div>
          <CardDescription className="text-xs text-muted-foreground">
            3 active collections
          </CardDescription>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Tags</CardTitle>
          <Tag className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.tagsCount}</div>
          <CardDescription className="text-xs text-muted-foreground">
            Most used: development
          </CardDescription>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.recentActivity}</div>
          <CardDescription className="text-xs text-muted-foreground">
            Added this week
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  );
}