"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { db, auth } from "../../../../../database/firebase";
import {
  collection as firestoreCollection,
  doc,
  getDocs,
  deleteDoc,
  updateDoc,
  query,
  where,
  DocumentData,
  addDoc,
} from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  ChevronLeftIcon,
  PlusIcon,
  SearchIcon,
  ArrowUpDownIcon,
  BookmarkIcon,
  FolderIcon,
  TagIcon,
  XIcon,
  StarIcon,
  ExternalLinkIcon,
  MoreHorizontalIcon,
  HeartIcon,
  ClockIcon,
  ArrowRightIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../../../../components/ui/tab";
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

// Define Bookmark and Collection types
interface Bookmark {
  id: string;
  title: string;
  description: string;
  url: string;
  domain: string;
  favicon: string;
  tags: string[];
  dateAdded: string;
  isFavorite: boolean;
}

interface Collection {
  id: string;
  title: string;
  titleLower: string;
  description: string;
  color: string;
  isQuickAccess: boolean;
  usageCount: number;
  bookmarkCount: number;
  createdAt: string;
  previewLinks: Array<{
    title: string;
    url: string;
    domain: string;
    favicon: string;
  }>;
  bookmarks: Bookmark[];
}

export default function CollectionPage() {
  const { slug } = useParams() as { slug: string };
  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTagFilters, setActiveTagFilters] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState("date-desc");

  // State for new bookmark form
  const [newBookmark, setNewBookmark] = useState({
    title: "",
    description: "",
    url: "",
    tags: "",
  });

  // Function to sanitize titleLower to match URL slug format
  const sanitizeTitleLower = (title: string) =>
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .trim();

  // Fetch collection and bookmarks from Firestore, and increment usageCount
  useEffect(() => {
    const fetchCollection = async () => {
      const user = auth.currentUser;
      if (!user) {
        setError("User not authenticated. Please log in.");
        setLoading(false);
        return;
      }

      if (!slug) {
        setError("No collection slug provided.");
        setLoading(false);
        return;
      }

      const normalizedSlug = sanitizeTitleLower(decodeURIComponent(slug));

      try {
        console.log("Fetching collection for slug:", slug);
        console.log("User ID:", user.uid);

        let collectionData: Collection;
        let bookmarks: Bookmark[] = [];

        // Handle the "Uncategorized" collection
        if (normalizedSlug === "uncategorized") {
          // Construct a virtual "Uncategorized" collection
          collectionData = {
            id: "uncategorized",
            title: "Uncategorized",
            titleLower: "uncategorized",
            description: "Bookmarks without a collection",
            color: "bg-gray-500",
            isQuickAccess: false,
            usageCount: 0,
            bookmarkCount: 0,
            createdAt: new Date().toISOString(),
            previewLinks: [],
            bookmarks: [],
          };

          // Fetch bookmarks for the "Uncategorized" collection
          const bookmarksRef = firestoreCollection(db, `users/${user.uid}/bookmarks`);
          const bookmarksQuery = query(
            bookmarksRef,
            where("collection", "==", "Uncategorized")
          );
          const bookmarksSnapshot = await getDocs(bookmarksQuery);
          bookmarks = bookmarksSnapshot.docs.map((doc) => {
            const bookmarkData: DocumentData = doc.data();
            return {
              id: doc.id,
              title: bookmarkData.title || "",
              description: bookmarkData.description || "",
              url: bookmarkData.url || "",
              domain: bookmarkData.domain || new URL(bookmarkData.url || "https://example.com").hostname,
              favicon: bookmarkData.favicon || "/placeholder.svg?height=16&width=16",
              tags: bookmarkData.tags || [],
              dateAdded: bookmarkData.dateAdded || new Date().toISOString(),
              isFavorite: bookmarkData.isFavorite || false,
            };
          });

          console.log("Fetched bookmarks for Uncategorized:", bookmarks);

          // Update bookmarkCount and previewLinks
          collectionData.bookmarkCount = bookmarks.length;
          collectionData.previewLinks = bookmarks.slice(0, 3).map((bookmark) => ({
            title: bookmark.title,
            url: bookmark.url,
            domain: bookmark.domain,
            favicon: bookmark.favicon,
          }));
        } else {
          // Fetch the collection by slug (titleLower) for regular collections
          const collectionsRef = firestoreCollection(db, `users/${user.uid}/collections`);
          const q = query(collectionsRef, where("titleLower", "==", normalizedSlug));
          const snapshot = await getDocs(q);

          // Debug: Log all collections
          const allCollectionsSnapshot = await getDocs(collectionsRef);
          console.log(
            "All collections in Firestore:",
            allCollectionsSnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))
          );

          console.log("Query snapshot for slug:", snapshot.docs.map((doc) => doc.data()));

          if (snapshot.empty) {
            console.log("No collection found for slug:", normalizedSlug);
            setError("Collection not found.");
            setLoading(false);
            return;
          }

          const collectionDoc = snapshot.docs[0];
          const collectionDataRaw: DocumentData = collectionDoc.data();
          collectionData = {
            id: collectionDoc.id,
            title: collectionDataRaw.title || "",
            titleLower: collectionDataRaw.titleLower || sanitizeTitleLower(collectionDataRaw.title),
            description: collectionDataRaw.description || "",
            color: collectionDataRaw.color || "bg-blue-500",
            isQuickAccess: collectionDataRaw.isQuickAccess || false,
            usageCount: collectionDataRaw.usageCount || 0,
            bookmarkCount: collectionDataRaw.bookmarkCount || 0,
            createdAt: collectionDataRaw.createdAt || new Date().toISOString(),
            previewLinks: collectionDataRaw.previewLinks || [],
            bookmarks: [],
          };

          // Fetch bookmarks for this collection
          const bookmarksRef = firestoreCollection(db, `users/${user.uid}/bookmarks`);
          const bookmarksQuery = query(
            bookmarksRef,
            where("collection", "==", collectionData.title)
          );
          const bookmarksSnapshot = await getDocs(bookmarksQuery);
          bookmarks = bookmarksSnapshot.docs.map((doc) => {
            const bookmarkData: DocumentData = doc.data();
            return {
              id: doc.id,
              title: bookmarkData.title || "",
              description: bookmarkData.description || "",
              url: bookmarkData.url || "",
              domain: bookmarkData.domain || new URL(bookmarkData.url || "https://example.com").hostname,
              favicon: bookmarkData.favicon || "/placeholder.svg?height=16&width=16",
              tags: bookmarkData.tags || [],
              dateAdded: bookmarkData.dateAdded || new Date().toISOString(),
              isFavorite: bookmarkData.isFavorite || false,
            };
          });

          console.log("Fetched bookmarks:", bookmarks);

          // Increment usageCount for regular collections
          await incrementUsageCount(collectionDoc.id, collectionData.usageCount);
        }

        // Set the collection with bookmarks
        setCollection({ ...collectionData, bookmarks });
      } catch (error) {
        console.error("Error fetching collection:", error);
        setError("Failed to load collection. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCollection();
  }, [slug]);

  // Increment usage count (only for regular collections)
  const incrementUsageCount = async (collectionId: string, currentUsageCount: number) => {
    const user = auth.currentUser;
    if (!user) return;

    // Skip incrementing usageCount for "Uncategorized"
    if (collectionId === "uncategorized") return;

    const updatedUsageCount = currentUsageCount + 1;

    try {
      await updateDoc(doc(db, `users/${user.uid}/collections`, collectionId), {
        usageCount: updatedUsageCount,
      });
      setCollection((prev) =>
        prev ? { ...prev, usageCount: updatedUsageCount } : prev
      );
    } catch (error) {
      console.error("Error incrementing usage count:", error);
    }
  };

  // Handle adding a new bookmark
  const handleAddBookmark = async () => {
    const user = auth.currentUser;
    if (!user || !collection) return;

    try {
      const url = newBookmark.url.trim();
      if (!url.match(/^https?:\/\//)) {
        throw new Error("Invalid URL: Please include http:// or https://");
      }
      const parsedUrl = new URL(url);

      const bookmark = {
        title: newBookmark.title,
        description: newBookmark.description,
        url: newBookmark.url,
        domain: parsedUrl.hostname,
        favicon: `https://www.google.com/s2/favicons?domain=${parsedUrl.hostname}`,
        tags: newBookmark.tags
          .split(",")
          .map((tag) => tag.trim().toLowerCase())
          .filter((tag) => tag.length > 0),
        dateAdded: new Date().toISOString(),
        isFavorite: false,
        collection: collection.title,
      };

      const userBookmarksRef = firestoreCollection(db, `users/${user.uid}/bookmarks`);
      const docRef = await addDoc(userBookmarksRef, bookmark);

      const updatedPreviewLinks = [
        ...(collection.previewLinks || []),
        {
          title: newBookmark.title,
          url: newBookmark.url,
          domain: parsedUrl.hostname,
          favicon: bookmark.favicon,
        },
      ].slice(0, 3);

      // Update Firestore only if it's not the "Uncategorized" collection
      if (collection.id !== "uncategorized") {
        await updateDoc(doc(db, `users/${user.uid}/collections`, collection.id), {
          bookmarkCount: collection.bookmarkCount + 1,
          previewLinks: updatedPreviewLinks,
        });
      }

      setCollection({
        ...collection,
        bookmarks: [...collection.bookmarks, { ...bookmark, id: docRef.id }],
        bookmarkCount: collection.bookmarkCount + 1,
        previewLinks: updatedPreviewLinks,
      });
      setNewBookmark({ title: "", description: "", url: "", tags: "" });
    } catch (error: unknown) {
      console.error("Error adding bookmark:", error);
      const errorMessage = error instanceof Error ? error.message : "Please try again.";
      alert(`Failed to add bookmark: ${errorMessage}`);
    }
  };

  // Toggle Quick Access (disable for "Uncategorized")
  const toggleQuickAccess = async () => {
    const user = auth.currentUser;
    if (!user || !collection || collection.id === "uncategorized") return;

    const updatedCollection = { ...collection, isQuickAccess: !collection.isQuickAccess };
    setCollection(updatedCollection);

    try {
      await updateDoc(doc(db, `users/${user.uid}/collections`, collection.id), {
        isQuickAccess: updatedCollection.isQuickAccess,
      });
    } catch (error) {
      console.error("Error updating Quick Access:", error);
    }
  };

  // Delete bookmark
  const deleteBookmark = async (bookmarkId: string) => {
    const user = auth.currentUser;
    if (!user || !collection) return;

    try {
      await deleteDoc(doc(db, `users/${user.uid}/bookmarks`, bookmarkId));

      const updatedBookmarks = collection.bookmarks.filter((b) => b.id !== bookmarkId);
      const updatedPreviewLinks = updatedBookmarks.slice(0, 3).map((bookmark) => ({
        title: bookmark.title,
        url: bookmark.url,
        domain: bookmark.domain,
        favicon: bookmark.favicon,
      }));

      // Update Firestore only if it's not the "Uncategorized" collection
      if (collection.id !== "uncategorized") {
        await updateDoc(doc(db, `users/${user.uid}/collections`, collection.id), {
          bookmarkCount: collection.bookmarkCount - 1,
          previewLinks: updatedPreviewLinks,
        });
      }

      setCollection({
        ...collection,
        bookmarks: updatedBookmarks,
        bookmarkCount: collection.bookmarkCount - 1,
        previewLinks: updatedPreviewLinks,
      });
    } catch (error) {
      console.error("Error deleting bookmark:", error);
    }
  };

  // Toggle favorite
  const toggleFavorite = async (bookmarkId: string) => {
    const user = auth.currentUser;
    if (!user || !collection) return;

    const updatedBookmarks = collection.bookmarks.map((b) =>
      b.id === bookmarkId ? { ...b, isFavorite: !b.isFavorite } : b
    );
    setCollection({ ...collection, bookmarks: updatedBookmarks });

    try {
      await updateDoc(doc(db, `users/${user.uid}/bookmarks`, bookmarkId), {
        isFavorite: updatedBookmarks.find((b) => b.id === bookmarkId)?.isFavorite,
      });
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  // Filter and sort bookmarks with a fallback to an empty array
  const filteredBookmarks: Bookmark[] = (collection?.bookmarks || [])
    .filter((bookmark) => {
      const matchesSearch =
        bookmark.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bookmark.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bookmark.url.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTags =
        activeTagFilters.length === 0 ||
        activeTagFilters.every((tag) => bookmark.tags.includes(tag));
      return matchesSearch && matchesTags;
    })
    .sort((a, b) => {
      if (sortOrder === "date-desc") {
        return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
      } else if (sortOrder === "date-asc") {
        return new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime();
      } else if (sortOrder === "title-asc") {
        return a.title.localeCompare(b.title);
      } else if (sortOrder === "title-desc") {
        return b.title.localeCompare(a.title);
      }
      return 0;
    });

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto mb-2"></div>
          <p>Loading collection...</p>
        </div>
      </div>
    );
  }

  // Authentication check
  if (!auth.currentUser) {
    window.location.href = "/login";
    return null;
  }

  // Error state
  if (error || !collection) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-red-500">{error || "Collection not found."}</p>
          <Button variant="outline" className="mt-4" asChild>
            <Link href="/app/bookmark/collections">Back to Collections</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Explicitly type allTags as string[]
  const allTags: string[] = Array.from(new Set(collection.bookmarks.flatMap((bookmark) => bookmark.tags))).sort();

  return (
    <div className="flex min-h-screen w-full bg-background">
      <main className="flex-1 p-6 max-w-full">
        {/* Collection Header */}
        <div
          className={`rounded-lg p-6 mb-6 ${collection.color} bg-opacity-10 border border-${collection.color.replace("bg-", "")}/20`}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-lg ${collection.color} bg-opacity-20 flex items-center justify-center`}
              >
                <FolderIcon className={`h-6 w-6 text-${collection.color.replace("bg-", "")}`} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">{collection.title}</h1>
                  {collection.id !== "uncategorized" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-8 px-3 gap-1.5 ${
                        collection.isQuickAccess
                          ? "bg-yellow-100/50 text-yellow-700 hover:bg-yellow-200/50 hover:text-yellow-800"
                          : "hover:bg-yellow-100/50 hover:text-yellow-700"
                      }`}
                      onClick={toggleQuickAccess}
                    >
                      <StarIcon
                        className={`h-4 w-4 ${
                          collection.isQuickAccess ? "fill-yellow-400 text-yellow-400" : ""
                        }`}
                      />
                      {collection.isQuickAccess ? "In Quick Access" : "Add to Quick Access"}
                    </Button>
                  )}
                </div>
                <p className="text-muted-foreground mt-1">{collection.description}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/app/bookmark/collections">
                  <ChevronLeftIcon className="h-4 w-4 mr-1" />
                  Back
                </Link>
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Bookmark
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Add Bookmark</DialogTitle>
                    <DialogDescription>Add a new bookmark to this collection.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        placeholder="Bookmark title"
                        value={newBookmark.title}
                        onChange={(e) => setNewBookmark({ ...newBookmark, title: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        placeholder="Bookmark description"
                        value={newBookmark.description}
                        onChange={(e) =>
                          setNewBookmark({ ...newBookmark, description: e.target.value })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="url">URL</Label>
                      <Input
                        id="url"
                        placeholder="Bookmark URL"
                        value={newBookmark.url}
                        onChange={(e) => setNewBookmark({ ...newBookmark, url: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="tags">Tags (comma-separated)</Label>
                      <Input
                        id="tags"
                        placeholder="e.g., tag1, tag2, tag3"
                        value={newBookmark.tags}
                        onChange={(e) => setNewBookmark({ ...newBookmark, tags: e.target.value })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleAddBookmark}>Add Bookmark</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Search and filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Search in ${collection.title}...`}
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <TagIcon className="h-4 w-4" />
                  Tags
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Filter by Tag</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {allTags.map((tag) => (
                  <DropdownMenuCheckboxItem
                    key={tag}
                    checked={activeTagFilters.includes(tag)}
                    onCheckedChange={(checked) => {
                      setActiveTagFilters((prev) =>
                        checked ? [...prev, tag] : prev.filter((t) => t !== tag)
                      );
                    }}
                  >
                    {tag}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="w-[180px] gap-2">
                <ArrowUpDownIcon className="h-4 w-4" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Newest First</SelectItem>
                <SelectItem value="date-asc">Oldest First</SelectItem>
                <SelectItem value="title-asc">Title (A-Z)</SelectItem>
                <SelectItem value="title-desc">Title (Z-A)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active tag filters */}
        {activeTagFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="text-sm text-muted-foreground mr-2 py-1">Active tag filters:</div>
            {activeTagFilters.map((tag) => (
              <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                <TagIcon className="h-3 w-3" />
                {tag}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 ml-1 p-0"
                  onClick={() => setActiveTagFilters((prev) => prev.filter((t) => t !== tag))}
                >
                  <XIcon className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-6"
              onClick={() => setActiveTagFilters([])}
            >
              Clear all
            </Button>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="all" className="mb-6">
          <TabsList className="flex flex-wrap justify-start">
            <TabsTrigger value="all" className="flex items-center gap-1">
              <BookmarkIcon className="h-4 w-4" />
              All
            </TabsTrigger>
            <TabsTrigger value="favorites" className="flex items-center gap-1">
              <HeartIcon className="h-4 w-4" />
              Favorites
            </TabsTrigger>
            <TabsTrigger value="recent" className="flex items-center gap-1">
              <ClockIcon className="h-4 w-4" />
              Recent
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">All Bookmarks</CardTitle>
                <CardDescription>All bookmarks in this collection</CardDescription>
              </CardHeader>
              <CardContent>
                {filteredBookmarks.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">No bookmarks in this collection yet.</p>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="mt-2">
                          Add a Bookmark
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Add Bookmark</DialogTitle>
                          <DialogDescription>Add a new bookmark to this collection.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                              id="title"
                              placeholder="Bookmark title"
                              value={newBookmark.title}
                              onChange={(e) => setNewBookmark({ ...newBookmark, title: e.target.value })}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Input
                              id="description"
                              placeholder="Bookmark description"
                              value={newBookmark.description}
                              onChange={(e) =>
                                setNewBookmark({ ...newBookmark, description: e.target.value })
                              }
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="url">URL</Label>
                            <Input
                              id="url"
                              placeholder="Bookmark URL"
                              value={newBookmark.url}
                              onChange={(e) => setNewBookmark({ ...newBookmark, url: e.target.value })}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="tags">Tags (comma-separated)</Label>
                            <Input
                              id="tags"
                              placeholder="e.g., tag1, tag2, tag3"
                              value={newBookmark.tags}
                              onChange={(e) => setNewBookmark({ ...newBookmark, tags: e.target.value })}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button onClick={handleAddBookmark}>Add Bookmark</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredBookmarks.map((bookmark) => (
                      <div
                        key={bookmark.id}
                        className="group relative flex flex-col rounded-lg border p-4 hover:border-primary transition-colors h-full"
                      >
                        <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => toggleFavorite(bookmark.id)}
                          >
                            {bookmark.isFavorite ? (
                              <HeartIcon className="h-4 w-4 fill-red-500 text-red-500" />
                            ) : (
                              <HeartIcon className="h-4 w-4" />
                            )}
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                            <Link href={bookmark.url} target="_blank">
                              <ExternalLinkIcon className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>

                        <div className="flex items-start gap-3 mb-2">
                          <div className="w-8 h-8 rounded-md overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center">
                            <img
                              src={bookmark.favicon || "/placeholder.svg"}
                              alt=""
                              className="w-5 h-5"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "/placeholder.svg?height=16&width=16";
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0 pr-8">
                            <Link
                              href={bookmark.url}
                              target="_blank"
                              className="font-medium hover:underline line-clamp-1 block"
                            >
                              {bookmark.title}
                            </Link>
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                              {bookmark.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
                          {bookmark.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex items-center justify-between mt-3 pt-3 border-t text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <ClockIcon className="h-3 w-3" />
                            <span>{new Date(bookmark.dateAdded).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                  <MoreHorizontalIcon className="h-3.5 w-3.5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>Edit</DropdownMenuItem>
                                <DropdownMenuItem>Add to Collection</DropdownMenuItem>
                                <DropdownMenuItem>Add Tags</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => deleteBookmark(bookmark.id)}
                                >
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/app/bookmark/bookmarks" className="flex items-center gap-1">
                    View all bookmarks
                    <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="favorites" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Favorite Bookmarks</CardTitle>
                <CardDescription>Bookmarks you&apos;ve marked as favorites</CardDescription>
              </CardHeader>
              <CardContent>
                {filteredBookmarks.filter((bookmark) => bookmark.isFavorite).length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">No favorite bookmarks in this collection.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredBookmarks
                      .filter((bookmark) => bookmark.isFavorite)
                      .map((bookmark) => (
                        <div
                          key={bookmark.id}
                          className="group relative flex flex-col rounded-lg border p-4 hover:border-primary transition-colors h-full"
                        >
                          <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => toggleFavorite(bookmark.id)}
                            >
                              <HeartIcon className="h-4 w-4 fill-red-500 text-red-500" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                              <Link href={bookmark.url} target="_blank">
                                <ExternalLinkIcon className="h-4 w-4" />
                              </Link>
                            </Button>
                          </div>

                          <div className="flex items-start gap-3 mb-2">
                            <div className="w-8 h-8 rounded-md overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center">
                              <img
                                src={bookmark.favicon || "/placeholder.svg"}
                                alt=""
                                className="w-5 h-5"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = "/placeholder.svg?height=16&width=16";
                                }}
                              />
                            </div>
                            <div className="flex-1 min-w-0 pr-8">
                              <Link
                                href={bookmark.url}
                                target="_blank"
                                className="font-medium hover:underline line-clamp-1 block"
                              >
                                {bookmark.title}
                              </Link>
                              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                {bookmark.description}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
                            {bookmark.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>

                          <div className="flex items-center justify-between mt-3 pt-3 border-t text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <ClockIcon className="h-3 w-3" />
                              <span>{new Date(bookmark.dateAdded).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-6 w-6">
                                    <MoreHorizontalIcon className="h-3.5 w-3.5" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>Edit</DropdownMenuItem>
                                  <DropdownMenuItem>Add to Collection</DropdownMenuItem>
                                  <DropdownMenuItem>Add Tags</DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => deleteBookmark(bookmark.id)}
                                  >
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/app/bookmark/bookmarks?favorites=true" className="flex items-center gap-1">
                    View all favorites
                    <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="recent" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Recent Bookmarks</CardTitle>
                <CardDescription>Recently added bookmarks in this collection</CardDescription>
              </CardHeader>
              <CardContent>
                {filteredBookmarks.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">No recent bookmarks in this collection.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredBookmarks
                      .slice(0, 3)
                      .map((bookmark) => (
                        <div
                          key={bookmark.id}
                          className="group relative flex flex-col rounded-lg border p-4 hover:border-primary transition-colors h-full"
                        >
                          <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => toggleFavorite(bookmark.id)}
                            >
                              {bookmark.isFavorite ? (
                                <HeartIcon className="h-4 w-4 fill-red-500 text-red-500" />
                              ) : (
                                <HeartIcon className="h-4 w-4" />
                              )}
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                              <Link href={bookmark.url} target="_blank">
                                <ExternalLinkIcon className="h-4 w-4" />
                              </Link>
                            </Button>
                          </div>

                          <div className="flex items-start gap-3 mb-2">
                            <div className="w-8 h-8 rounded-md overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center">
                              <img
                                src={bookmark.favicon || "/placeholder.svg"}
                                alt=""
                                className="w-5 h-5"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = "/placeholder.svg?height=16&width=16";
                                }}
                              />
                            </div>
                            <div className="flex-1 min-w-0 pr-8">
                              <Link
                                href={bookmark.url}
                                target="_blank"
                                className="font-medium hover:underline line-clamp-1 block"
                              >
                                {bookmark.title}
                              </Link>
                              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                {bookmark.description}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
                            {bookmark.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>

                          <div className="flex items-center justify-between mt-3 pt-3 border-t text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <ClockIcon className="h-3 w-3" />
                              <span>{new Date(bookmark.dateAdded).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-6 w-6">
                                    <MoreHorizontalIcon className="h-3.5 w-3.5" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>Edit</DropdownMenuItem>
                                  <DropdownMenuItem>Add to Collection</DropdownMenuItem>
                                  <DropdownMenuItem>Add Tags</DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => deleteBookmark(bookmark.id)}
                                  >
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/app/bookmark/bookmarks?recent=true" className="flex items-center gap-1">
                    View all recent bookmarks
                    <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}