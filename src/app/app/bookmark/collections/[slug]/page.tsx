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
  GridIcon,
  ListIcon,
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
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

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
  const [viewMode, setViewMode] = useState<"grid" | "list">("list"); // Default to list
  const [currentPage, setCurrentPage] = useState(1);
  const bookmarksPerPage = 9;

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
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .trim();

  // Fetch collection and bookmarks from Firestore
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
        let collectionData: Collection;
        let bookmarks: Bookmark[] = [];

        if (normalizedSlug === "uncategorized") {
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

          const bookmarksRef = firestoreCollection(db, `users/${user.uid}/bookmarks`);
          const bookmarksQuery = query(bookmarksRef, where("collection", "==", "Uncategorized"));
          const bookmarksSnapshot = await getDocs(bookmarksQuery);
          bookmarks = bookmarksSnapshot.docs.map((doc) => ({
            id: doc.id,
            title: doc.data().title || "",
            description: doc.data().description || "",
            url: doc.data().url || "",
            domain: doc.data().domain || new URL(doc.data().url || "https://example.com").hostname,
            favicon: doc.data().favicon || "/placeholder.svg?height=16&width=16",
            tags: doc.data().tags || [],
            dateAdded: doc.data().dateAdded || new Date().toISOString(),
            isFavorite: doc.data().isFavorite || false,
          }));

          collectionData.bookmarkCount = bookmarks.length;
          collectionData.previewLinks = bookmarks.slice(0, 3).map((bookmark) => ({
            title: bookmark.title,
            url: bookmark.url,
            domain: bookmark.domain,
            favicon: bookmark.favicon,
          }));
        } else {
          const collectionsRef = firestoreCollection(db, `users/${user.uid}/collections`);
          const q = query(collectionsRef, where("titleLower", "==", normalizedSlug));
          const snapshot = await getDocs(q);

          if (snapshot.empty) {
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

          const bookmarksRef = firestoreCollection(db, `users/${user.uid}/bookmarks`);
          const bookmarksQuery = query(bookmarksRef, where("collection", "==", collectionData.title));
          const bookmarksSnapshot = await getDocs(bookmarksQuery);
          bookmarks = bookmarksSnapshot.docs.map((doc) => ({
            id: doc.id,
            title: doc.data().title || "",
            description: doc.data().description || "",
            url: doc.data().url || "",
            domain: doc.data().domain || new URL(doc.data().url || "https://example.com").hostname,
            favicon: doc.data().favicon || "/placeholder.svg?height=16&width=16",
            tags: doc.data().tags || [],
            dateAdded: doc.data().dateAdded || new Date().toISOString(),
            isFavorite: doc.data().isFavorite || false,
          }));

          await incrementUsageCount(collectionDoc.id, collectionData.usageCount);
        }

        setCollection({ ...collectionData, bookmarks });
      } catch (error) {
        console.error("Error fetching collection:", error);
        setError("Failed to load collection.");
      } finally {
        setLoading(false);
      }
    };

    fetchCollection();
  }, [slug]);

  // Increment usage count
  const incrementUsageCount = async (collectionId: string, currentUsageCount: number) => {
    const user = auth.currentUser;
    if (!user || collectionId === "uncategorized") return;

    const updatedUsageCount = currentUsageCount + 1;
    await updateDoc(doc(db, `users/${user.uid}/collections`, collectionId), {
      usageCount: updatedUsageCount,
    });
    setCollection((prev) => (prev ? { ...prev, usageCount: updatedUsageCount } : prev));
  };

  // Handle adding a new bookmark
  const handleAddBookmark = async () => {
    const user = auth.currentUser;
    if (!user || !collection) return;

    try {
      const url = newBookmark.url.trim();
      if (!url.match(/^https?:\/\//)) throw new Error("Invalid URL");
      const parsedUrl = new URL(url);

      const bookmark = {
        title: newBookmark.title,
        description: newBookmark.description,
        url: newBookmark.url,
        domain: parsedUrl.hostname,
        favicon: `https://www.google.com/s2/favicons?domain=${parsedUrl.hostname}`,
        tags: newBookmark.tags.split(",").map((tag) => tag.trim().toLowerCase()).filter(Boolean),
        dateAdded: new Date().toISOString(),
        isFavorite: false,
        collection: collection.title,
      };

      const userBookmarksRef = firestoreCollection(db, `users/${user.uid}/bookmarks`);
      const docRef = await addDoc(userBookmarksRef, bookmark);

      const updatedPreviewLinks = [
        ...(collection.previewLinks || []),
        { title: newBookmark.title, url: newBookmark.url, domain: parsedUrl.hostname, favicon: bookmark.favicon },
      ].slice(0, 3);

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
    } catch (error) {
      console.error("Error adding bookmark:", error);
      alert("Failed to add bookmark: " + (error instanceof Error ? error.message : "Please try again."));
    }
  };

  // Toggle Quick Access
  const toggleQuickAccess = async () => {
    const user = auth.currentUser;
    if (!user || !collection || collection.id === "uncategorized") return;

    const updatedCollection = { ...collection, isQuickAccess: !collection.isQuickAccess };
    setCollection(updatedCollection);
    await updateDoc(doc(db, `users/${user.uid}/collections`, collection.id), {
      isQuickAccess: updatedCollection.isQuickAccess,
    });
  };

  // Delete bookmark
  const deleteBookmark = async (bookmarkId: string) => {
    const user = auth.currentUser;
    if (!user || !collection) return;

    await deleteDoc(doc(db, `users/${user.uid}/bookmarks`, bookmarkId));
    const updatedBookmarks = collection.bookmarks.filter((b) => b.id !== bookmarkId);
    const updatedPreviewLinks = updatedBookmarks.slice(0, 3).map((bookmark) => ({
      title: bookmark.title,
      url: bookmark.url,
      domain: bookmark.domain,
      favicon: bookmark.favicon,
    }));

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
  };

  // Toggle favorite
  const toggleFavorite = async (bookmarkId: string) => {
    const user = auth.currentUser;
    if (!user || !collection) return;

    const updatedBookmarks = collection.bookmarks.map((b) =>
      b.id === bookmarkId ? { ...b, isFavorite: !b.isFavorite } : b
    );
    setCollection({ ...collection, bookmarks: updatedBookmarks });
    await updateDoc(doc(db, `users/${user.uid}/bookmarks`, bookmarkId), {
      isFavorite: updatedBookmarks.find((b) => b.id === bookmarkId)?.isFavorite,
    });
  };

  // Filter and sort bookmarks
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
      if (sortOrder === "date-desc") return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
      if (sortOrder === "date-asc") return new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime();
      if (sortOrder === "title-asc") return a.title.localeCompare(b.title);
      if (sortOrder === "title-desc") return b.title.localeCompare(a.title);
      return 0;
    });

  // Pagination logic
  const totalBookmarks = filteredBookmarks.length;
  const totalPages = Math.ceil(totalBookmarks / bookmarksPerPage);
  const paginatedBookmarks = filteredBookmarks.slice(
    (currentPage - 1) * bookmarksPerPage,
    currentPage * bookmarksPerPage
  );

  const favoriteBookmarks = filteredBookmarks.filter((bookmark) => bookmark.isFavorite);
  const totalFavoritePages = Math.ceil(favoriteBookmarks.length / bookmarksPerPage);
  const paginatedFavoriteBookmarks = favoriteBookmarks.slice(
    (currentPage - 1) * bookmarksPerPage,
    currentPage * bookmarksPerPage
  );

  const recentBookmarks = filteredBookmarks.slice(0, Math.min(filteredBookmarks.length, 9));
  const totalRecentPages = Math.ceil(recentBookmarks.length / bookmarksPerPage);
  const paginatedRecentBookmarks = recentBookmarks.slice(
    (currentPage - 1) * bookmarksPerPage,
    currentPage * bookmarksPerPage
  );

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

  if (!auth.currentUser) {
    window.location.href = "/login";
    return null;
  }

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

        {/* Search, filters, and view toggle */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
          <div className="relative flex-1 w-full md:w-auto">
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
                    onCheckedChange={(checked) =>
                      setActiveTagFilters((prev) =>
                        checked ? [...prev, tag] : prev.filter((t) => t !== tag)
                      )
                    }
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

            <Button
              variant="outline"
              size="icon"
              onClick={() => setViewMode(viewMode === "list" ? "grid" : "list")}
              title={viewMode === "list" ? "Switch to Grid View" : "Switch to List View"}
            >
              {viewMode === "list" ? <GridIcon className="h-4 w-4" /> : <ListIcon className="h-4 w-4" />}
            </Button>
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
                {paginatedBookmarks.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">No bookmarks in this collection yet.</p>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="mt-2">Add a Bookmark</Button>
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
                              onChange={(e) => setNewBookmark({ ...newBookmark, description: e.target.value })}
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
                ) : viewMode === "list" ? (
                  <div className="space-y-2">
                    {paginatedBookmarks.map((bookmark) => (
                      <div
                        key={bookmark.id}
                        className="group flex items-center rounded-lg border p-2 hover:border-primary transition-colors"
                      >
                        <div className="w-6 h-6 rounded overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center mr-2">
                          <img
                            src={bookmark.favicon || "/placeholder.svg"}
                            alt=""
                            className="w-4 h-4"
                            onError={(e) => (e.currentTarget.src = "/placeholder.svg?height=16&width=16")}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <Link
                              href={bookmark.url}
                              target="_blank"
                              className="text-sm font-medium hover:underline truncate block flex-1"
                            >
                              {bookmark.title}
                            </Link>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => toggleFavorite(bookmark.id)}
                              >
                                {bookmark.isFavorite ? (
                                  <HeartIcon className="h-3 w-3 fill-red-500 text-red-500" />
                                ) : (
                                  <HeartIcon className="h-3 w-3" />
                                )}
                              </Button>
                              <Button variant="ghost" size="icon" className="h-6 w-6" asChild>
                                <Link href={bookmark.url} target="_blank">
                                  <ExternalLinkIcon className="h-3 w-3" />
                                </Link>
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-6 w-6">
                                    <MoreHorizontalIcon className="h-3 w-3" />
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
                          <p className="text-xs text-muted-foreground truncate">{bookmark.description}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {bookmark.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-[10px] py-0 px-1">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            <ClockIcon className="h-3 w-3 inline mr-1" />
                            {new Date(bookmark.dateAdded).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {paginatedBookmarks.map((bookmark) => (
                      <div
                        key={bookmark.id}
                        className="group relative flex flex-col rounded-lg border p-2 hover:border-primary transition-colors"
                      >
                        <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => toggleFavorite(bookmark.id)}
                          >
                            {bookmark.isFavorite ? (
                              <HeartIcon className="h-3 w-3 fill-red-500 text-red-500" />
                            ) : (
                              <HeartIcon className="h-3 w-3" />
                            )}
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6" asChild>
                            <Link href={bookmark.url} target="_blank">
                              <ExternalLinkIcon className="h-3 w-3" />
                            </Link>
                          </Button>
                        </div>
                        <div className="flex items-start gap-2 mb-1">
                          <div className="w-6 h-6 rounded overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center">
                            <img
                              src={bookmark.favicon || "/placeholder.svg"}
                              alt=""
                              className="w-4 h-4"
                              onError={(e) => (e.currentTarget.src = "/placeholder.svg?height=16&width=16")}
                            />
                          </div>
                          <div className="flex-1 min-w-0 pr-6">
                            <Link
                              href={bookmark.url}
                              target="_blank"
                              className="text-sm font-medium hover:underline line-clamp-1 block"
                            >
                              {bookmark.title}
                            </Link>
                            <p className="text-xs text-muted-foreground line-clamp-1">{bookmark.description}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-auto">
                          {bookmark.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-[10px] py-0 px-1">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
                          <span>{new Date(bookmark.dateAdded).toLocaleDateString()}</span>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6">
                                <MoreHorizontalIcon className="h-3 w-3" />
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
                    ))}
                  </div>
                )}
              </CardContent>
              {totalPages > 1 && (
                <CardFooter>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => setCurrentPage(page)}
                            isActive={currentPage === page}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </CardFooter>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="favorites" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Favorite Bookmarks</CardTitle>
                <CardDescription>Bookmarks you&apos;ve marked as favorites</CardDescription>
              </CardHeader>
              <CardContent>
                {paginatedFavoriteBookmarks.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">No favorite bookmarks in this collection.</p>
                  </div>
                ) : viewMode === "list" ? (
                  <div className="space-y-2">
                    {paginatedFavoriteBookmarks.map((bookmark) => (
                      <div
                        key={bookmark.id}
                        className="group flex items-center rounded-lg border p-2 hover:border-primary transition-colors"
                      >
                        <div className="w-6 h-6 rounded overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center mr-2">
                          <img
                            src={bookmark.favicon || "/placeholder.svg"}
                            alt=""
                            className="w-4 h-4"
                            onError={(e) => (e.currentTarget.src = "/placeholder.svg?height=16&width=16")}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <Link
                              href={bookmark.url}
                              target="_blank"
                              className="text-sm font-medium hover:underline truncate block flex-1"
                            >
                              {bookmark.title}
                            </Link>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => toggleFavorite(bookmark.id)}
                              >
                                <HeartIcon className="h-3 w-3 fill-red-500 text-red-500" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-6 w-6" asChild>
                                <Link href={bookmark.url} target="_blank">
                                  <ExternalLinkIcon className="h-3 w-3" />
                                </Link>
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-6 w-6">
                                    <MoreHorizontalIcon className="h-3 w-3" />
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
                          <p className="text-xs text-muted-foreground truncate">{bookmark.description}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {bookmark.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-[10px] py-0 px-1">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            <ClockIcon className="h-3 w-3 inline mr-1" />
                            {new Date(bookmark.dateAdded).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {paginatedFavoriteBookmarks.map((bookmark) => (
                      <div
                        key={bookmark.id}
                        className="group relative flex flex-col rounded-lg border p-2 hover:border-primary transition-colors"
                      >
                        <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => toggleFavorite(bookmark.id)}
                          >
                            <HeartIcon className="h-3 w-3 fill-red-500 text-red-500" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6" asChild>
                            <Link href={bookmark.url} target="_blank">
                              <ExternalLinkIcon className="h-3 w-3" />
                            </Link>
                          </Button>
                        </div>
                        <div className="flex items-start gap-2 mb-1">
                          <div className="w-6 h-6 rounded overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center">
                            <img
                              src={bookmark.favicon || "/placeholder.svg"}
                              alt=""
                              className="w-4 h-4"
                              onError={(e) => (e.currentTarget.src = "/placeholder.svg?height=16&width=16")}
                            />
                          </div>
                          <div className="flex-1 min-w-0 pr-6">
                            <Link
                              href={bookmark.url}
                              target="_blank"
                              className="text-sm font-medium hover:underline line-clamp-1 block"
                            >
                              {bookmark.title}
                            </Link>
                            <p className="text-xs text-muted-foreground line-clamp-1">{bookmark.description}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-auto">
                          {bookmark.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-[10px] py-0 px-1">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
                          <span>{new Date(bookmark.dateAdded).toLocaleDateString()}</span>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6">
                                <MoreHorizontalIcon className="h-3 w-3" />
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
                    ))}
                  </div>
                )}
              </CardContent>
              {totalFavoritePages > 1 && (
                <CardFooter>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                      {Array.from({ length: totalFavoritePages }, (_, i) => i + 1).map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => setCurrentPage(page)}
                            isActive={currentPage === page}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalFavoritePages))}
                          className={currentPage === totalFavoritePages ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </CardFooter>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="recent" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Recent Bookmarks</CardTitle>
                <CardDescription>Recently added bookmarks in this collection</CardDescription>
              </CardHeader>
              <CardContent>
                {paginatedRecentBookmarks.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">No recent bookmarks in this collection.</p>
                  </div>
                ) : viewMode === "list" ? (
                  <div className="space-y-2">
                    {paginatedRecentBookmarks.map((bookmark) => (
                      <div
                        key={bookmark.id}
                        className="group flex items-center rounded-lg border p-2 hover:border-primary transition-colors"
                      >
                        <div className="w-6 h-6 rounded overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center mr-2">
                          <img
                            src={bookmark.favicon || "/placeholder.svg"}
                            alt=""
                            className="w-4 h-4"
                            onError={(e) => (e.currentTarget.src = "/placeholder.svg?height=16&width=16")}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <Link
                              href={bookmark.url}
                              target="_blank"
                              className="text-sm font-medium hover:underline truncate block flex-1"
                            >
                              {bookmark.title}
                            </Link>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => toggleFavorite(bookmark.id)}
                              >
                                {bookmark.isFavorite ? (
                                  <HeartIcon className="h-3 w-3 fill-red-500 text-red-500" />
                                ) : (
                                  <HeartIcon className="h-3 w-3" />
                                )}
                              </Button>
                              <Button variant="ghost" size="icon" className="h-6 w-6" asChild>
                                <Link href={bookmark.url} target="_blank">
                                  <ExternalLinkIcon className="h-3 w-3" />
                                </Link>
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-6 w-6">
                                    <MoreHorizontalIcon className="h-3 w-3" />
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
                          <p className="text-xs text-muted-foreground truncate">{bookmark.description}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {bookmark.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-[10px] py-0 px-1">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            <ClockIcon className="h-3 w-3 inline mr-1" />
                            {new Date(bookmark.dateAdded).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {paginatedRecentBookmarks.map((bookmark) => (
                      <div
                        key={bookmark.id}
                        className="group relative flex flex-col rounded-lg border p-2 hover:border-primary transition-colors"
                      >
                        <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => toggleFavorite(bookmark.id)}
                          >
                            {bookmark.isFavorite ? (
                              <HeartIcon className="h-3 w-3 fill-red-500 text-red-500" />
                            ) : (
                              <HeartIcon className="h-3 w-3" />
                            )}
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6" asChild>
                            <Link href={bookmark.url} target="_blank">
                              <ExternalLinkIcon className="h-3 w-3" />
                            </Link>
                          </Button>
                        </div>
                        <div className="flex items-start gap-2 mb-1">
                          <div className="w-6 h-6 rounded overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center">
                            <img
                              src={bookmark.favicon || "/placeholder.svg"}
                              alt=""
                              className="w-4 h-4"
                              onError={(e) => (e.currentTarget.src = "/placeholder.svg?height=16&width=16")}
                            />
                          </div>
                          <div className="flex-1 min-w-0 pr-6">
                            <Link
                              href={bookmark.url}
                              target="_blank"
                              className="text-sm font-medium hover:underline line-clamp-1 block"
                            >
                              {bookmark.title}
                            </Link>
                            <p className="text-xs text-muted-foreground line-clamp-1">{bookmark.description}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-auto">
                          {bookmark.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-[10px] py-0 px-1">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
                          <span>{new Date(bookmark.dateAdded).toLocaleDateString()}</span>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6">
                                <MoreHorizontalIcon className="h-3 w-3" />
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
                    ))}
                  </div>
                )}
              </CardContent>
              {totalRecentPages > 1 && (
                <CardFooter>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                      {Array.from({ length: totalRecentPages }, (_, i) => i + 1).map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => setCurrentPage(page)}
                            isActive={currentPage === page}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalRecentPages))}
                          className={currentPage === totalRecentPages ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </CardFooter>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}