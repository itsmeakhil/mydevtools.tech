"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../components/ui/tab";
import {
  BookmarkIcon,
  FolderIcon,
  TagIcon,
  PlusIcon,
  SearchIcon,
  FilterIcon,
  ArrowUpDownIcon,
  ExternalLinkIcon,
  MoreHorizontalIcon,
  ListIcon,
  GridIcon,
  XIcon,
  HeartIcon,
  ClockIcon,
  TrendingUpIcon,
  PencilIcon,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { db, auth } from "../../../../database/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, addDoc, doc, updateDoc, deleteDoc, onSnapshot, getDocs } from "firebase/firestore";
import { Timestamp } from "firebase/firestore";

// Define TypeScript interfaces
interface Bookmark {
  id: string;
  title: string;
  description: string;
  url: string;
  favicon: string;
  tags: string[];
  collection: string;
  dateAdded: string | Timestamp; // Allow for both string and Timestamp
  isFavorite: boolean;
  visitCount: number;
}

interface Collection {
  id: string;
  name: string;
  color: string;
}

// Utility function to convert dateAdded to a Date object
const parseDate = (dateAdded: string | Timestamp): Date => {
  if (dateAdded instanceof Timestamp) {
    return dateAdded.toDate();
  }
  const parsedDate = new Date(dateAdded);
  if (isNaN(parsedDate.getTime())) {
    // Fallback to current date if invalid
    return new Date();
  }
  return parsedDate;
};

// Bookmark Edit Form Component
function BookmarkEditForm({
  bookmark,
  onSave,
  collections,
}: {
  bookmark: Bookmark;
  onSave: (updatedBookmark: Bookmark) => void;
  collections: Collection[];
}) {
  const [editBookmark, setEditBookmark] = useState<Bookmark>({ ...bookmark });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setEditBookmark((prev) => ({ ...prev, [id.replace("edit-", "")]: value }));
  };

  const handleSelectChange = (value: string) => {
    setEditBookmark((prev) => ({ ...prev, collection: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setEditBookmark((prev) => ({ ...prev, isFavorite: checked }));
  };

  const handleSubmit = () => {
    const updatedBookmark = {
      ...editBookmark,
      tags: editBookmark.tags.join(", ").split(",").map((tag) => tag.trim()).filter((tag) => tag.length > 0),
    };
    onSave(updatedBookmark);
  };

  return (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="edit-url">URL</Label>
        <Input id="edit-url" value={editBookmark.url} onChange={handleInputChange} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="edit-title">Title</Label>
        <Input id="edit-title" value={editBookmark.title} onChange={handleInputChange} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="edit-description">Description</Label>
        <Textarea id="edit-description" value={editBookmark.description} onChange={handleInputChange} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="edit-collection">Collection</Label>
        <Select onValueChange={handleSelectChange} defaultValue={editBookmark.collection}>
          <SelectTrigger id="edit-collection">
            <SelectValue placeholder="Select a collection" />
          </SelectTrigger>
          <SelectContent>
            {collections.map((collection) => (
              <SelectItem key={collection.id} value={collection.name}>
                {collection.name}
              </SelectItem>
            ))}
            <SelectItem value="Uncategorized">Uncategorized</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="edit-tags">Tags</Label>
        <Input
          id="edit-tags"
          value={editBookmark.tags.join(", ")}
          onChange={(e) =>
            setEditBookmark((prev) => ({
              ...prev,
              tags: e.target.value.split(",").map((tag) => tag.trim()),
            }))
          }
        />
      </div>
      <div className="flex items-center space-x-2 pt-2">
        <Switch id="edit-favorite" checked={editBookmark.isFavorite} onCheckedChange={handleSwitchChange} />
        <Label htmlFor="edit-favorite">Mark as favorite</Label>
      </div>
      <DialogFooter>
        <Button onClick={handleSubmit}>Save changes</Button>
      </DialogFooter>
    </div>
  );
}

// Bookmark Card Component
function BookmarkCard({
  bookmark,
  onEdit,
  onDelete,
  onToggleFavorite,
  onVisit,
  collections,
}: {
  bookmark: Bookmark;
  onEdit: (updatedBookmark: Bookmark) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onVisit: (id: string) => void;
  collections: Collection[];
}) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Parse the dateAdded field safely
  const formattedDate = format(parseDate(bookmark.dateAdded), "MM/dd/yyyy");

  return (
    <div
      key={bookmark.id}
      className="group relative flex flex-col rounded-lg border p-4 hover:border-primary transition-colors h-full"
    >
      <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onToggleFavorite(bookmark.id)}>
          {bookmark.isFavorite ? (
            <HeartIcon className="h-4 w-4 fill-red-500 text-red-500" />
          ) : (
            <HeartIcon className="h-4 w-4" />
          )}
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
          <Link href={bookmark.url} target="_blank" onClick={() => onVisit(bookmark.id)}>
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
              (e.target as HTMLImageElement).src = "/placeholder.svg?height=16&width=16";
            }}
          />
        </div>
        <div className="flex-1 min-w-0 pr-8">
          <Link
            href={bookmark.url}
            target="_blank"
            className="font-medium hover:underline line-clamp-1 block"
            onClick={() => onVisit(bookmark.id)}
          >
            {bookmark.title}
          </Link>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{bookmark.description}</p>
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
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs font-normal">
            {bookmark.collection}
          </Badge>
          <span>{formattedDate}</span>
        </div>
        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <MoreHorizontalIcon className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <PencilIcon className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[525px]">
                  <DialogHeader>
                    <DialogTitle>Edit Bookmark</DialogTitle>
                    <DialogDescription>Make changes to your bookmark.</DialogDescription>
                  </DialogHeader>
                  <BookmarkEditForm
                    bookmark={bookmark}
                    onSave={(updatedBookmark) => {
                      onEdit(updatedBookmark);
                      setIsEditDialogOpen(false);
                    }}
                    collections={collections}
                  />
                </DialogContent>
              </Dialog>
              <DropdownMenuItem>Add to Collection</DropdownMenuItem>
              <DropdownMenuItem>Add Tags</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={() => onDelete(bookmark.id)}>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

export default function BookmarksPage() {
  const [user, setUser] = useState<User | null>(null);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [activeFilters, setActiveFilters] = useState({
    collections: [] as string[],
    tags: [] as string[],
  });
  const [sortOption, setSortOption] = useState("date-desc");
  const [searchQuery, setSearchQuery] = useState("");
  const [newBookmark, setNewBookmark] = useState({
    url: "",
    title: "",
    description: "",
    collection: "",
    tags: "",
    isFavorite: false,
  });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Monitor authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Fetch collections from Firestore
  useEffect(() => {
    if (!user) {
      setCollections([]);
      return;
    }

    const fetchCollections = async () => {
      try {
        const collectionsRef = collection(db, `users/${user.uid}/collections`);
        const snapshot = await getDocs(collectionsRef);
        const fetchedCollections: Collection[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().title,
          color: doc.data().color || "bg-blue-500",
        }));
        setCollections(fetchedCollections);
      } catch (error) {
        console.error("Error fetching collections:", error);
      }
    };

    fetchCollections();
  }, [user]);

  // Fetch bookmarks from Firestore with real-time updates
  useEffect(() => {
    if (!user) {
      setBookmarks([]);
      return;
    }

    const q = collection(db, `users/${user.uid}/bookmarks`);
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const updatedBookmarks = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            tags: data.tags || [],
            dateAdded: data.dateAdded instanceof Timestamp ? data.dateAdded : data.dateAdded || new Date().toISOString(),
          };
        }) as Bookmark[];
        setBookmarks(updatedBookmarks);
      },
      (error) => {
        console.error("Error listening to bookmarks: ", error);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Get all unique tags from bookmarks
  const allTags = Array.from(new Set(bookmarks.flatMap((bookmark) => bookmark.tags))).sort();

  // Filter and sort bookmarks
  const filteredBookmarks = bookmarks
    .filter((bookmark) => {
      const matchesSearch =
        bookmark.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bookmark.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCollection =
        activeFilters.collections.length === 0 || activeFilters.collections.includes(bookmark.collection);
      const matchesTags =
        activeFilters.tags.length === 0 || bookmark.tags.some((tag) => activeFilters.tags.includes(tag));
      return matchesSearch && matchesCollection && matchesTags;
    })
    .sort((a, b) => {
      const dateA = parseDate(a.dateAdded);
      const dateB = parseDate(b.dateAdded);
      if (sortOption === "date-desc") return dateB.getTime() - dateA.getTime();
      if (sortOption === "date-asc") return dateA.getTime() - dateB.getTime();
      if (sortOption === "title-asc") return a.title.localeCompare(b.title);
      if (sortOption === "title-desc") return b.title.localeCompare(a.title);
      if (sortOption === "visits-desc") return b.visitCount - a.visitCount;
      return 0;
    });

  // Handle adding a new bookmark
  const handleAddBookmark = async () => {
    if (!user) {
      alert("You must be logged in to add a bookmark.");
      return;
    }

    try {
      const url = newBookmark.url.trim();
      if (!url.match(/^https?:\/\//)) {
        throw new Error("Invalid URL: Please include http:// or https://");
      }
      new URL(url);

      if (bookmarks.some((b) => b.url === url)) {
        alert("This URL is already bookmarked!");
        return;
      }

      const tagsArray = newBookmark.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      const bookmark = {
        url,
        title: newBookmark.title,
        description: newBookmark.description,
        collection: newBookmark.collection || "Uncategorized",
        tags: tagsArray,
        isFavorite: newBookmark.isFavorite,
        dateAdded: new Date().toISOString(),
        visitCount: 0,
        favicon: url
          ? `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}`
          : "/placeholder.svg",
      };

      const userBookmarksRef = collection(db, `users/${user.uid}/bookmarks`);
      await addDoc(userBookmarksRef, bookmark);

      setNewBookmark({
        url: "",
        title: "",
        description: "",
        collection: "",
        tags: "",
        isFavorite: false,
      });
      setIsAddDialogOpen(false);

      alert("Bookmark added successfully!");
    } catch (error: unknown) {
      console.error("Error adding bookmark: ", error);
      const errorMessage = error instanceof Error ? error.message : "Please try again.";
      alert(`Failed to add bookmark: ${errorMessage}`);
    }
  };

  // Handle editing a bookmark
  const handleEditBookmark = async (updatedBookmark: Bookmark) => {
    if (!user) return;

    try {
      const bookmarkRef = doc(db, `users/${user.uid}/bookmarks`, updatedBookmark.id);
      await updateDoc(bookmarkRef, {
        url: updatedBookmark.url,
        title: updatedBookmark.title,
        description: updatedBookmark.description,
        collection: updatedBookmark.collection,
        tags: updatedBookmark.tags,
        isFavorite: updatedBookmark.isFavorite,
      });
      alert("Bookmark updated successfully!");
    } catch (error) {
      console.error("Error updating bookmark: ", error);
      alert("Failed to update bookmark. Please try again.");
    }
  };

  // Handle deleting a bookmark
  const handleDeleteBookmark = async (id: string) => {
    if (!user) return;

    if (!confirm("Are you sure you want to delete this bookmark?")) return;

    try {
      const bookmarkRef = doc(db, `users/${user.uid}/bookmarks`, id);
      await deleteDoc(bookmarkRef);
      alert("Bookmark deleted successfully!");
    } catch (error) {
      console.error("Error deleting bookmark: ", error);
      alert("Failed to delete bookmark. Please try again.");
    }
  };

  // Handle toggling favorite
  const handleToggleFavorite = async (id: string) => {
    if (!user) return;

    const bookmark = bookmarks.find((b) => b.id === id);
    if (!bookmark) return;

    try {
      const bookmarkRef = doc(db, `users/${user.uid}/bookmarks`, id);
      await updateDoc(bookmarkRef, {
        isFavorite: !bookmark.isFavorite,
      });
    } catch (error) {
      console.error("Error toggling favorite: ", error);
    }
  };

  // Handle visit count increment
  const handleVisit = async (id: string) => {
    if (!user) return;

    try {
      const bookmarkRef = doc(db, `users/${user.uid}/bookmarks`, id);
      await updateDoc(bookmarkRef, {
        visitCount: bookmarks.find((b) => b.id === id)!.visitCount + 1,
      });
    } catch (error) {
      console.error("Error incrementing visit count: ", error);
    }
  };

  // Handle filter changes
  const handleFilterChange = (type: "collections" | "tags", value: string) => {
    setActiveFilters((prev) => {
      const current = prev[type];
      if (current.includes(value)) {
        return { ...prev, [type]: current.filter((item) => item !== value) };
      }
      return { ...prev, [type]: [...current, value] };
    });
  };

  // Handle clear all filters
  const handleClearFilters = () => {
    setActiveFilters({ collections: [], tags: [] });
  };

  if (!user) {
    return <div>Please log in to view your bookmarks.</div>;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <main className="flex-1 p-6">
        {/* Header */}
        <div className="rounded-lg p-6 mb-6 bg-primary/5 border">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                <BookmarkIcon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">All Bookmarks</h1>
                <p className="text-muted-foreground mt-1">Browse and manage all your saved bookmarks</p>
              </div>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Bookmark
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                  <DialogTitle>Add Bookmark</DialogTitle>
                  <DialogDescription>Add a new bookmark to your collection.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="url">URL</Label>
                    <Input
                      id="url"
                      placeholder="https://example.com"
                      value={newBookmark.url}
                      onChange={(e) => setNewBookmark((prev) => ({ ...prev, url: e.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="Bookmark title"
                      value={newBookmark.title}
                      onChange={(e) => setNewBookmark((prev) => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Bookmark description"
                      value={newBookmark.description}
                      onChange={(e) => setNewBookmark((prev) => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="collection">Collection</Label>
                    <Select onValueChange={(value) => setNewBookmark((prev) => ({ ...prev, collection: value }))}>
                      <SelectTrigger id="collection">
                        <SelectValue placeholder="Select a collection" />
                      </SelectTrigger>
                      <SelectContent>
                        {collections.map((collection) => (
                          <SelectItem key={collection.id} value={collection.name}>
                            {collection.name}
                          </SelectItem>
                        ))}
                        <SelectItem value="Uncategorized">Uncategorized</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="tags">Tags</Label>
                    <Input
                      id="tags"
                      placeholder="Enter tags separated by commas"
                      value={newBookmark.tags}
                      onChange={(e) => setNewBookmark((prev) => ({ ...prev, tags: e.target.value }))}
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-2">
                    <Switch
                      id="favorite"
                      checked={newBookmark.isFavorite}
                      onCheckedChange={(checked) =>
                        setNewBookmark((prev) => ({ ...prev, isFavorite: checked }))
                      }
                    />
                    <Label htmlFor="favorite">Mark as favorite</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddBookmark}>Add Bookmark</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Search and filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search bookmarks..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <FilterIcon className="h-4 w-4" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Filter by Collection</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {collections.map((collection) => (
                  <DropdownMenuCheckboxItem
                    key={collection.id}
                    checked={activeFilters.collections.includes(collection.name)}
                    onCheckedChange={() => handleFilterChange("collections", collection.name)}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${collection.color}`}></div>
                      {collection.name}
                    </div>
                  </DropdownMenuCheckboxItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Filter by Tag</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {allTags.slice(0, 5).map((tag) => (
                  <DropdownMenuCheckboxItem
                    key={tag}
                    checked={activeFilters.tags.includes(tag)}
                    onCheckedChange={() => handleFilterChange("tags", tag)}
                  >
                    {tag}
                  </DropdownMenuCheckboxItem>
                ))}
                <DropdownMenuItem>
                  <Link href="/tags" className="w-full">
                    View all tags...
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Select value={sortOption} onValueChange={setSortOption}>
              <SelectTrigger className="w-[180px] gap-2">
                <ArrowUpDownIcon className="h-4 w-4" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Newest First</SelectItem>
                <SelectItem value="date-asc">Oldest First</SelectItem>
                <SelectItem value="title-asc">Title (A-Z)</SelectItem>
                <SelectItem value="title-desc">Title (Z-A)</SelectItem>
                <SelectItem value="visits-desc">Most Visited</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex border rounded-md">
              <Button variant="ghost" size="icon" className="rounded-r-none border-r" asChild>
                <Link href="/app/bookmark/bookmarks/list">
                  <ListIcon className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" className="rounded-l-none bg-accent text-accent-foreground">
                <GridIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Active filters */}
        {(activeFilters.collections.length > 0 || activeFilters.tags.length > 0) && (
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="text-sm text-muted-foreground mr-2 py-1">Active filters:</div>
            {activeFilters.collections.map((collection) => (
              <Badge key={collection} variant="secondary" className="flex items-center gap-1">
                <FolderIcon className="h-3 w-3" />
                {collection}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 ml-1 p-0"
                  onClick={() => handleFilterChange("collections", collection)}
                >
                  <XIcon className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
            {activeFilters.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                <TagIcon className="h-3 w-3" />
                {tag}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 ml-1 p-0"
                  onClick={() => handleFilterChange("tags", tag)}
                >
                  <XIcon className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
            <Button variant="ghost" size="sm" className="text-xs h-6" onClick={handleClearFilters}>
              Clear all
            </Button>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="all" className="mb-6">
          <TabsList>
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
            <TabsTrigger value="popular" className="flex items-center gap-1">
              <TrendingUpIcon className="h-4 w-4" />
              Most Visited
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">All Bookmarks</CardTitle>
                <CardDescription>Browse all your saved bookmarks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredBookmarks.map((bookmark) => (
                    <BookmarkCard
                      key={bookmark.id}
                      bookmark={bookmark}
                      onEdit={handleEditBookmark}
                      onDelete={handleDeleteBookmark}
                      onToggleFavorite={handleToggleFavorite}
                      onVisit={handleVisit}
                      collections={collections}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="favorites" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Favorite Bookmarks</CardTitle>
                <CardDescription>Bookmarks you&apos;ve marked as favorites</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredBookmarks
                    .filter((bookmark) => bookmark.isFavorite)
                    .map((bookmark) => (
                      <BookmarkCard
                        key={bookmark.id}
                        bookmark={bookmark}
                        onEdit={handleEditBookmark}
                        onDelete={handleDeleteBookmark}
                        onToggleFavorite={handleToggleFavorite}
                        onVisit={handleVisit}
                        collections={collections}
                      />
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recent" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Recent Bookmarks</CardTitle>
                <CardDescription>Recently added bookmarks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredBookmarks
                    .sort((a, b) => parseDate(b.dateAdded).getTime() - parseDate(a.dateAdded).getTime())
                    .slice(0, 6)
                    .map((bookmark) => (
                      <BookmarkCard
                        key={bookmark.id}
                        bookmark={bookmark}
                        onEdit={handleEditBookmark}
                        onDelete={handleDeleteBookmark}
                        onToggleFavorite={handleToggleFavorite}
                        onVisit={handleVisit}
                        collections={collections}
                      />
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="popular" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Most Visited Bookmarks</CardTitle>
                <CardDescription>Your most frequently visited bookmarks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredBookmarks
                    .sort((a, b) => b.visitCount - a.visitCount)
                    .slice(0, 6)
                    .map((bookmark) => (
                      <BookmarkCard
                        key={bookmark.id}
                        bookmark={bookmark}
                        onEdit={handleEditBookmark}
                        onDelete={handleDeleteBookmark}
                        onToggleFavorite={handleToggleFavorite}
                        onVisit={handleVisit}
                        collections={collections}
                      />
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Popular Tags */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Popular Tags</h3>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="px-3 py-1 hover:bg-accent cursor-pointer"
                  onClick={() => handleFilterChange("tags", tag)}
                >
                  {tag} ({bookmarks.filter((b) => b.tags.includes(tag)).length})
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pagination (Placeholder - Add real pagination logic as needed) */}
        <div className="flex items-center justify-between mt-8">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium">1</span> to{" "}
            <span className="font-medium">{filteredBookmarks.length}</span> of{" "}
            <span className="font-medium">{bookmarks.length}</span> bookmarks
          </p>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" className="bg-accent text-accent-foreground">
              1
            </Button>
            <Button variant="outline" size="sm">2</Button>
            <Button variant="outline" size="sm">3</Button>
            <Button variant="outline" size="sm">...</Button>
            <Button variant="outline" size="sm">21</Button>
            <Button variant="outline" size="sm">Next</Button>
          </div>
        </div>
      </main>
    </div>
  );
}