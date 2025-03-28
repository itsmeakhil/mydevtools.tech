"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ExternalLinkIcon,
  HeartIcon,
  ClockIcon,
  ListIcon,
  GridIcon,
  TrendingUpIcon,
} from "lucide-react";

// Define the Bookmark interface
interface Bookmark {
  id: string;
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

interface RecentBookmarksProps {
  recentBookmarks: Bookmark[];
  favoriteBookmarks: Bookmark[];
  popularBookmarks: Bookmark[];
  incrementVisitCount: (bookmarkId: string) => void;
}

export default function RecentBookmarks({
  recentBookmarks,
  favoriteBookmarks,
  popularBookmarks,
  incrementVisitCount,
}: RecentBookmarksProps) {
  const [activeTab, setActiveTab] = useState<"recent" | "favorites" | "popular">("recent");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list"); // Changed default to "list"
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; // Limit to 9 bookmarks per page

  // Determine which bookmarks to display based on the active tab
  const bookmarksToDisplay =
    activeTab === "recent"
      ? recentBookmarks
      : activeTab === "favorites"
      ? favoriteBookmarks
      : popularBookmarks;

  // Calculate pagination details
  const totalPages = Math.ceil(bookmarksToDisplay.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBookmarks = bookmarksToDisplay.slice(startIndex, endIndex);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const contentArea = document.getElementById("recent-bookmarks-content");
    if (contentArea) {
      contentArea.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Handle tab change
  const handleTabChange = (tab: "recent" | "favorites" | "popular") => {
    setActiveTab(tab);
    setCurrentPage(1); // Reset to first page when switching tabs
    const contentArea = document.getElementById("recent-bookmarks-content");
    if (contentArea) {
      contentArea.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                variant={activeTab === "recent" ? "secondary" : "outline"}
                size="default"
                onClick={() => handleTabChange("recent")}
                className="flex items-center gap-1 font-bold px-4 py-2"
              >
                <ClockIcon className="h-4 w-4" />
                Recent
              </Button>
              <Button
                variant={activeTab === "favorites" ? "secondary" : "outline"}
                size="default"
                onClick={() => handleTabChange("favorites")}
                className="flex items-center gap-1 font-bold px-4 py-2"
              >
                <HeartIcon className="h-4 w-4" />
                Favorites
              </Button>
              <Button
                variant={activeTab === "popular" ? "secondary" : "outline"}
                size="default"
                onClick={() => handleTabChange("popular")}
                className="flex items-center gap-1 font-bold px-4 py-2"
              >
                <TrendingUpIcon className="h-4 w-4" />
                Popular
              </Button>
            </div>
            <div className="flex border rounded-md">
              <Button
                variant="ghost"
                size="icon"
                className={`rounded-r-none border-r ${
                  viewMode === "list" ? "bg-accent text-accent-foreground" : ""
                }`}
                onClick={() => setViewMode("list")}
              >
                <ListIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={`rounded-l-none ${
                  viewMode === "grid" ? "bg-accent text-accent-foreground" : ""
                }`}
                onClick={() => setViewMode("grid")}
              >
                <GridIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <CardDescription className="text-sm text-muted-foreground">
            {activeTab === "recent"
              ? "Bookmarks you’ve added in the last few days"
              : activeTab === "favorites"
              ? "Bookmarks you’ve marked as favorites"
              : "Your most visited bookmarks"}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent
        id="recent-bookmarks-content"
        className="flex-1 max-h-[500px] overflow-y-auto p-4"
      >
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {paginatedBookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                className="group relative flex flex-col rounded-lg border p-3 hover:border-primary transition-colors h-full"
              >
                <div className="absolute top-2 right-2 flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <HeartIcon
                      className={`h-4 w-4 ${
                        bookmark.isFavorite ? "fill-red-500 text-red-500" : ""
                      }`}
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    asChild
                  >
                    <Link
                      href={bookmark.url}
                      target="_blank"
                      onClick={() => incrementVisitCount(bookmark.id)}
                    >
                      <ExternalLinkIcon className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                <div className="flex items-start gap-2 mb-2">
                  <div className="w-6 h-6 rounded-md overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center">
                    <Image
                      src={bookmark.favicon || "/placeholder.svg"}
                      alt={`${bookmark.title} favicon`}
                      width={16}
                      height={16}
                      className="w-4 h-4"
                    />
                  </div>
                  <div className="flex-1 min-w-0 pr-6">
                    <Link
                      href={bookmark.url}
                      target="_blank"
                      onClick={() => incrementVisitCount(bookmark.id)}
                      className="font-medium text-sm hover:underline line-clamp-1 block"
                    >
                      {bookmark.title}
                    </Link>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                      {bookmark.description}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mt-auto pt-2">
                  {bookmark.tags.map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <ClockIcon className="h-3 w-3" />
                    <span>{new Date(bookmark.dateAdded).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {paginatedBookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                className="group relative flex items-center gap-3 p-3 rounded-lg border hover:border-primary transition-colors"
              >
                <div className="w-6 h-6 rounded-md overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center">
                  <Image
                    src={bookmark.favicon || "/placeholder.svg"}
                    alt={`${bookmark.title} favicon`}
                    width={16}
                    height={16}
                    className="w-4 h-4"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <Link
                      href={bookmark.url}
                      target="_blank"
                      onClick={() => incrementVisitCount(bookmark.id)}
                      className="font-medium text-sm hover:underline line-clamp-1"
                    >
                      {bookmark.title}
                    </Link>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <HeartIcon
                          className={`h-4 w-4 ${
                            bookmark.isFavorite ? "fill-red-500 text-red-500" : ""
                          }`}
                        />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6" asChild>
                        <Link
                          href={bookmark.url}
                          target="_blank"
                          onClick={() => incrementVisitCount(bookmark.id)}
                        >
                          <ExternalLinkIcon className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                    {bookmark.description}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {bookmark.tags.map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                    <ClockIcon className="h-3 w-3" />
                    <span>{new Date(bookmark.dateAdded).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-3 p-3 border-t">
        <p className="text-xs text-muted-foreground">
          Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
          <span className="font-medium">{Math.min(endIndex, bookmarksToDisplay.length)}</span> of{" "}
          <span className="font-medium">{bookmarksToDisplay.length}</span> bookmarks
        </p>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
            <Button
              key={page}
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page)}
              className={currentPage === page ? "bg-accent text-accent-foreground" : ""}
            >
              {page}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}