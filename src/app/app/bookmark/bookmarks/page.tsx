"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, } from "../../../../components/ui/tab";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { db, auth } from "../../../../database/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, addDoc, doc, updateDoc, deleteDoc, onSnapshot, getDocs } from "firebase/firestore";
import { Timestamp } from "firebase/firestore";
import BookmarkImporter from "../Component/BookmarkImportDialog";
import BookmarkExporter from "../Component/BookmarkExportDialog";

// Define TypeScript interfaces
interface Bookmark {
  id: string;
  title: string;
  description: string;
  url: string;
  favicon: string;
  tags: string[];
  collection: string;
  dateAdded: string | Timestamp;
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
    return new Date();
  }
  return parsedDate;
};

// Bookmark Edit Form Component (unchanged)
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

// Bookmark Card Component (unchanged)
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

// Define extended Collection interface for BookmarkImporter
interface UserCollection {
  id: string;
  title: string;
  description: string;
  count: number;
  previewLinks: { title: string; url: string; domain: string; favicon: string }[];
  color: string;
}

export default function BookmarksPage() {
  const [user, setUser] = useState<User | null>(null);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [userCollections, setUserCollections] = useState<UserCollection[]>([]);
  const [activeFilters, setActiveFilters] = useState({
    collections: [] as string[],
    tags: [] as string[],
  });
  const [sortOption, setSortOption] = useState("date-desc");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [newBookmark, setNewBookmark] = useState({
    url: "",
    title: "",
    description: "",
    collection: "",
    tags: "",
    isFavorite: false,
  });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<"all" | "favorites" | "recent" | "popular">("all"); // New state for tabs

  const itemsPerPageList = 13;
  const itemsPerPageGrid = 12;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setCollections([]);
      setUserCollections([]);
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
        
        // Also fetch for BookmarkImporter
        const fetchedUserCollections: UserCollection[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          title: doc.data().title,
          description: doc.data().description,
          count: doc.data().bookmarkCount || 0,
          previewLinks: doc.data().previewLinks || [],
          color: doc.data().color || "bg-blue-500",
        }));
        setUserCollections(fetchedUserCollections);
      } catch (error) {
        console.error("Error fetching collections:", error);
      }
    };

    fetchCollections();
  }, [user]);

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

  const allTags = Array.from(new Set(bookmarks.flatMap((bookmark) => bookmark.tags))).sort();

  // Filter bookmarks based on active tab first
  const tabFilteredBookmarks = bookmarks.filter((bookmark) => {
    if (activeTab === "favorites") return bookmark.isFavorite;
    if (activeTab === "recent") return true; // We'll sort and limit later
    if (activeTab === "popular") return true; // We'll sort by visitCount later
    return true; // "all" tab
  });

  // Apply additional filters (search, collections, tags)
  const filteredBookmarks = tabFilteredBookmarks
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
      if (activeTab === "recent") return dateB.getTime() - dateA.getTime();
      if (activeTab === "popular") return b.visitCount - a.visitCount;
      if (sortOption === "date-desc") return dateB.getTime() - dateA.getTime();
      if (sortOption === "date-asc") return dateA.getTime() - dateB.getTime();
      if (sortOption === "title-asc") return a.title.localeCompare(b.title);
      if (sortOption === "title-desc") return b.title.localeCompare(a.title);
      if (sortOption === "visits-desc") return b.visitCount - a.visitCount;
      return 0;
    });

  // Limit recent and popular tabs if needed
  const displayBookmarks =
    activeTab === "recent" || activeTab === "popular"
      ? filteredBookmarks.slice(0, 6) // Limit to 6 for recent and popular, adjust as needed
      : filteredBookmarks;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeFilters, sortOption, viewMode, activeTab]);

  const itemsPerPage = viewMode === "list" ? itemsPerPageList : itemsPerPageGrid;
  const totalPages = Math.ceil(displayBookmarks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBookmarks = displayBookmarks.slice(startIndex, endIndex);

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

  const handleFilterChange = (type: "collections" | "tags", value: string) => {
    setActiveFilters((prev) => {
      const current = prev[type];
      if (current.includes(value)) {
        return { ...prev, [type]: current.filter((item) => item !== value) };
      }
      return { ...prev, [type]: [...current, value] };
    });
  };

  const handleClearFilters = () => {
    setActiveFilters({ collections: [], tags: [] });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    document.getElementById("bookmarks-content")?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleTabChange = (tab: "all" | "favorites" | "recent" | "popular") => {
    setActiveTab(tab);
    setCurrentPage(1); // Reset to first page when switching tabs
  };

  if (!user) {
    return <div>Please log in to view your bookmarks.</div>;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <main className="flex-1 p-6 flex flex-col">
        <div className="flex-shrink-0">
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
              <div className="flex gap-2">
                <BookmarkImporter user={user} userCollections={userCollections} />
                <BookmarkExporter user={user} bookmarks={bookmarks} />
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
                  {allTags.map((tag) => (
                    <DropdownMenuCheckboxItem
                      key={tag}
                      checked={activeFilters.tags.includes(tag)}
                      onCheckedChange={() => handleFilterChange("tags", tag)}
                    >
                      {tag}
                    </DropdownMenuCheckboxItem>
                  ))}
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
                <Button
                  variant="ghost"
                  size="icon"
                  className={`rounded-r-none border-r ${viewMode === "list" ? "bg-accent text-accent-foreground" : ""}`}
                  onClick={() => setViewMode("list")}
                >
                  <ListIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`rounded-l-none ${viewMode === "grid" ? "bg-accent text-accent-foreground" : ""}`}
                  onClick={() => setViewMode("grid")}
                >
                  <GridIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

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

          <Tabs value={activeTab} onValueChange={(value) => handleTabChange(value as typeof activeTab)} className="mb-6">
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
          </Tabs>
        </div>

        <div id="bookmarks-content" className="flex-1 overflow-y-auto">
          {viewMode === "grid" ? (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">
                  {activeTab === "all" && "All Bookmarks"}
                  {activeTab === "favorites" && "Favorite Bookmarks"}
                  {activeTab === "recent" && "Recent Bookmarks"}
                  {activeTab === "popular" && "Most Visited Bookmarks"}
                </CardTitle>
                <CardDescription>
                  {activeTab === "all" && "Browse all your saved bookmarks"}
                  {activeTab === "favorites" && "Bookmarks you’ve marked as favorites"}
                  {activeTab === "recent" && "Recently added bookmarks"}
                  {activeTab === "popular" && "Your most frequently visited bookmarks"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {paginatedBookmarks.map((bookmark) => (
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
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead className="hidden md:table-cell">Collection</TableHead>
                    <TableHead className="hidden lg:table-cell">Tags</TableHead>
                    <TableHead className="hidden md:table-cell">Date Added</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedBookmarks.map((bookmark) => (
                    <TableRow key={bookmark.id}>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleToggleFavorite(bookmark.id)}
                        >
                          <HeartIcon
                            className={`h-4 w-4 ${bookmark.isFavorite ? "fill-red-400 text-red-400" : ""}`}
                          />
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-md overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center">
                            <img
                              src={bookmark.favicon || "/placeholder.svg"}
                              alt=""
                              className="w-4 h-4"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/placeholder.svg?height=16&width=16";
                              }}
                            />
                          </div>
                          <div>
                            <Link
                              href={bookmark.url}
                              target="_blank"
                              className="font-medium hover:underline"
                              onClick={() => handleVisit(bookmark.id)}
                            >
                              {bookmark.title}
                            </Link>
                            <div className="text-xs text-muted-foreground truncate max-w-[300px]">
                              {bookmark.url}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="outline">{bookmark.collection}</Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {bookmark.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {bookmark.tags.length > 2 && (
                            <span className="text-xs text-muted-foreground">
                              +{bookmark.tags.length - 2} more
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="text-sm text-muted-foreground">
                          {format(parseDate(bookmark.dateAdded), "MM/dd/yyyy")}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                            <Link href={bookmark.url} target="_blank" onClick={() => handleVisit(bookmark.id)}>
                              <ExternalLinkIcon className="h-4 w-4" />
                            </Link>
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontalIcon className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
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
                                      handleEditBookmark(updatedBookmark);
                                    }}
                                    collections={collections}
                                  />
                                </DialogContent>
                              </Dialog>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDeleteBookmark(bookmark.id)}
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <Card className="mb-6 mt-6">
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
        </div>

        <div className="flex-shrink-0 mt-8">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
              <span className="font-medium">{Math.min(endIndex, displayBookmarks.length)}</span> of{" "}
              <span className="font-medium">{displayBookmarks.length}</span> bookmarks
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
          </div>
        </div>
      </main>
    </div>
  );
}