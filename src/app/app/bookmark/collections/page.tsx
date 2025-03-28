"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { db, auth } from "../../../../database/firebase";
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  PlusIcon,
  SearchIcon,
  MoreHorizontalIcon,
  TrashIcon,
  StarIcon,
  ExternalLinkIcon,
  ArrowRightIcon,
  ListIcon,
  GridIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

// Define the Bookmark type
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
  domain: string;
}

// Define the Collection type
interface Collection {
  id: string;
  title: string;
  titleLower: string;
  description: string;
  bookmarkCount: number;
  usageCount: number;
  isQuickAccess: boolean;
  createdAt: string;
  color: string;
  previewLinks: Array<{
    title: string;
    url: string;
    domain: string;
    favicon: string;
  }>;
}

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list"); // Changed default to "list"
  const [currentPage, setCurrentPage] = useState(1);

  // State for new collection form
  const [newCollection, setNewCollection] = useState({
    title: "",
    description: "",
    isQuickAccess: false,
  });

  // Function to sanitize titleLower to match URL slug format
  const sanitizeTitleLower = (title: string) =>
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .trim();

  // Fetch collections and bookmarks from Firestore with real-time updates
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);

    // Listen for bookmarks updates
    const bookmarksRef = collection(db, `users/${user.uid}/bookmarks`);
    const unsubscribeBookmarks = onSnapshot(
      bookmarksRef,
      (snapshot) => {
        const fetchedBookmarks: Bookmark[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          url: doc.data().url || "",
          title: doc.data().title || "",
          description: doc.data().description || "",
          collection: doc.data().collection || "Uncategorized",
          tags: doc.data().tags || [],
          isFavorite: doc.data().isFavorite || false,
          dateAdded: doc.data().dateAdded || new Date().toISOString(),
          visitCount: doc.data().visitCount || 0,
          lastVisited: doc.data().lastVisited || null,
          favicon: doc.data().favicon || "/placeholder.svg",
          domain: doc.data().domain || new URL(doc.data().url || "https://example.com").hostname,
        }));

        setBookmarks(fetchedBookmarks);

        // Listen for collections updates
        const collectionsRef = collection(db, `users/${user.uid}/collections`);
        const unsubscribeCollections = onSnapshot(
          collectionsRef,
          (snapshot) => {
            const fetchedCollections: Collection[] = snapshot.docs.map((doc) => ({
              id: doc.id,
              title: doc.data().title,
              titleLower: doc.data().titleLower || sanitizeTitleLower(doc.data().title),
              description: doc.data().description || "",
              bookmarkCount: doc.data().bookmarkCount || 0,
              usageCount: doc.data().usageCount || 0,
              isQuickAccess: doc.data().isQuickAccess || false,
              createdAt: doc.data().createdAt || new Date().toISOString(),
              color: doc.data().color || "bg-blue-500", // Default color if none exists
              previewLinks: doc.data().previewLinks || [],
            }));

            // Update bookmarkCount and previewLinks for each collection
            const updatedCollections = fetchedCollections.map((collection) => {
              const collectionBookmarks = fetchedBookmarks.filter(
                (bookmark) => bookmark.collection.toLowerCase() === collection.title.toLowerCase()
              );
              const bookmarkCount = collectionBookmarks.length;
              const previewLinks = collectionBookmarks.slice(0, 3).map((bookmark) => ({
                title: bookmark.title,
                url: bookmark.url,
                domain: bookmark.domain,
                favicon: bookmark.favicon,
              }));

              return {
                ...collection,
                bookmarkCount,
                previewLinks,
              };
            });

            // Create an "Uncategorized" collection
            const uncategorizedBookmarks = fetchedBookmarks.filter(
              (bookmark) => bookmark.collection.toLowerCase() === "uncategorized"
            );
            const uncategorizedCollection: Collection = {
              id: "uncategorized",
              title: "Uncategorized",
              titleLower: "uncategorized",
              description: "Bookmarks without a collection",
              bookmarkCount: uncategorizedBookmarks.length,
              usageCount: 0,
              isQuickAccess: false,
              createdAt: new Date().toISOString(),
              color: "bg-gray-500",
              previewLinks: uncategorizedBookmarks.slice(0, 3).map((bookmark) => ({
                title: bookmark.title,
                url: bookmark.url,
                domain: bookmark.domain,
                favicon: bookmark.favicon,
              })),
            };

            // Combine collections with Uncategorized if it has bookmarks
            const allCollections =
              uncategorizedBookmarks.length > 0
                ? [...updatedCollections, uncategorizedCollection]
                : updatedCollections;

            setCollections(allCollections);
            setLoading(false);
          },
          (error) => {
            console.error("Error fetching collections:", error);
            setLoading(false);
          }
        );

        return () => unsubscribeCollections();
      },
      (error) => {
        console.error("Error fetching bookmarks:", error);
        setLoading(false);
      }
    );

    return () => unsubscribeBookmarks();
  }, []);

  // Filter collections based on search query (moved up)
  const filteredCollections = collections.filter((collection) =>
    collection.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination settings (now after filteredCollections)
  const itemsPerPage = 9;
  const totalPages = Math.ceil(filteredCollections.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCollections = filteredCollections.slice(startIndex, endIndex);

  // Handle creating a new collection with random color
  const handleCreateCollection = async () => {
    const user = auth.currentUser;
    if (!user) {
      window.location.href = "/login";
      return;
    }

    const newId = Date.now().toString();
    // Define a list of possible colors
    const colorOptions = [
      "bg-blue-500",
      "bg-purple-500",
      "bg-green-500",
      "bg-amber-500",
      "bg-red-500",
      "bg-indigo-500",
    ];
    // Select a random color
    const randomColor = colorOptions[Math.floor(Math.random() * colorOptions.length)];

    const collectionData: Collection = {
      id: newId,
      title: newCollection.title,
      titleLower: sanitizeTitleLower(newCollection.title),
      description: newCollection.description,
      bookmarkCount: 0,
      usageCount: 0,
      isQuickAccess: newCollection.isQuickAccess,
      createdAt: new Date().toISOString(),
      color: randomColor, // Assign the random color
      previewLinks: [],
    };

    try {
      await setDoc(
        doc(db, `users/${user.uid}/collections`, newId),
        collectionData
      );
      setNewCollection({ title: "", description: "", isQuickAccess: false });
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error creating collection:", error);
    }
  };

  // Handle toggling Quick Access
  const toggleQuickAccess = async (id: string) => {
    const user = auth.currentUser;
    if (!user) return;

    const collectionToUpdate = collections.find((c) => c.id === id);
    if (!collectionToUpdate) return;

    const updatedCollection = {
      ...collectionToUpdate,
      isQuickAccess: !collectionToUpdate.isQuickAccess,
    };
    setCollections(
      collections.map((c) => (c.id === id ? updatedCollection : c))
    );

    try {
      if (id !== "uncategorized") {
        await updateDoc(doc(db, `users/${user.uid}/collections`, id), {
          isQuickAccess: updatedCollection.isQuickAccess,
        });
      }
    } catch (error) {
      console.error("Error updating Quick Access:", error);
    }
  };

  // Handle deleting a collection
  const handleDeleteCollection = async (id: string) => {
    const user = auth.currentUser;
    if (!user) return;

    if (id === "uncategorized") {
      setCollections(collections.filter((collection) => collection.id !== id));
      return;
    }

    const collectionToDelete = collections.find((c) => c.id === id);
    if (collectionToDelete) {
      const collectionBookmarks = bookmarks.filter(
        (bookmark) => bookmark.collection.toLowerCase() === collectionToDelete.title.toLowerCase()
      );
      for (const bookmark of collectionBookmarks) {
        const bookmarkRef = doc(db, `users/${user.uid}/bookmarks`, bookmark.id);
        await updateDoc(bookmarkRef, { collection: "Uncategorized" });
      }
    }

    setCollections(collections.filter((collection) => collection.id !== id));

    try {
      await deleteDoc(doc(db, `users/${user.uid}/collections`, id));
    } catch (error) {
      console.error("Error deleting collection:", error);
    }
  };

  // Increment usage count
  const incrementUsageCount = async (id: string) => {
    const user = auth.currentUser;
    if (!user) return;

    const collectionToUpdate = collections.find((c) => c.id === id);
    if (!collectionToUpdate) return;

    const updatedCollection = {
      ...collectionToUpdate,
      usageCount: collectionToUpdate.usageCount + 1,
    };
    setCollections(
      collections.map((c) => (c.id === id ? updatedCollection : c))
    );

    try {
      if (id !== "uncategorized") {
        await updateDoc(doc(db, `users/${user.uid}/collections`, id), {
          usageCount: updatedCollection.usageCount,
        });
      }
    } catch (error) {
      console.error("Error incrementing usage count:", error);
    }
  };

  // Reset to page 1 when search query or view mode changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, viewMode]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to the top of the collections content
    document.getElementById("collections-content")?.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!auth.currentUser) {
    window.location.href = "/login";
    return null;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <main className="flex-1 p-6 flex flex-col">
        {/* Fixed Header Section */}
        <div className="flex-shrink-0">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Collections</h1>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  New Collection
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create Collection</DialogTitle>
                  <DialogDescription>
                    Create a new collection to organize your bookmarks.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      placeholder="Collection name"
                      value={newCollection.title}
                      onChange={(e) =>
                        setNewCollection({
                          ...newCollection,
                          title: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Collection description"
                      value={newCollection.description}
                      onChange={(e) =>
                        setNewCollection({
                          ...newCollection,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="quick-access"
                      checked={newCollection.isQuickAccess}
                      onCheckedChange={(checked) =>
                        setNewCollection({
                          ...newCollection,
                          isQuickAccess: checked,
                        })
                      }
                    />
                    <Label htmlFor="quick-access">Add to Quick Access</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleCreateCollection}>
                    Create Collection
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search and View Toggle */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative max-w-md flex-1">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search collections..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
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

        {/* Scrollable Content Section */}
        <div id="collections-content" className="flex-1 overflow-y-auto">
          {paginatedCollections.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-muted-foreground">No collections found.</p>
            </div>
          ) : viewMode === "grid" ? (
            // Grid View
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedCollections.map((collection) => (
                <Card
                  key={collection.id}
                  className="group overflow-hidden transition-all hover:shadow-md border-transparent hover:border-primary"
                >
                  <Link
                    href={`/app/bookmark/collections/${collection.titleLower}`}
                    className="block"
                    onClick={() => incrementUsageCount(collection.id)}
                  >
                    <CardHeader
                      className={`p-4 ${collection.color} bg-opacity-10 border-b relative overflow-hidden`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold text-lg flex items-center gap-2">
                            {collection.title}
                            {collection.isQuickAccess && (
                              <StarIcon className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            )}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {collection.description}
                          </p>
                        </div>
                        <Badge variant="secondary" className="rounded-full px-2.5">
                          {collection.bookmarkCount}
                        </Badge>
                      </div>
                    </CardHeader>
                  </Link>

                  <CardContent className="p-0 h-48 flex flex-col">
                    {collection.previewLinks.length === 0 ? (
                      <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
                        No bookmarks in this collection
                      </div>
                    ) : (
                      <div className="divide-y">
                        {collection.previewLinks.map((link, index) => (
                          <Link
                            key={index}
                            href={link.url}
                            target="_blank"
                            className="flex items-center gap-3 p-3 hover:bg-accent transition-colors group/link"
                          >
                            <div className="w-8 h-8 rounded-md overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center">
                              <img
                                src={link.favicon || "/placeholder.svg"}
                                alt=""
                                className="w-5 h-5"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = "/placeholder.svg?height=16&width=16";
                                }}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium line-clamp-1 group-hover/link:text-primary transition-colors">
                                {link.title}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {link.domain}
                              </p>
                            </div>
                            <ExternalLinkIcon className="h-4 w-4 text-muted-foreground opacity-0 group-hover/link:opacity-100 transition-opacity" />
                          </Link>
                        ))}
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="p-4 flex justify-between items-center border-t bg-muted/20">
                    <div className="flex items-center gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontalIcon className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuItem
                            onClick={() => toggleQuickAccess(collection.id)}
                          >
                            <StarIcon className="h-4 w-4 mr-2" />
                            {collection.isQuickAccess
                              ? "Remove from Quick Access"
                              : "Add to Quick Access"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeleteCollection(collection.id)}
                          >
                            <TrashIcon className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <span className="text-xs text-muted-foreground">
                        Created{" "}
                        {new Date(collection.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                      asChild
                    >
                      <Link
                        href={`/app/bookmark/collections/${collection.titleLower}`}
                        onClick={() => incrementUsageCount(collection.id)}
                      >
                        View all
                        <ArrowRightIcon className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            // List View
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead className="hidden md:table-cell">Description</TableHead>
                    <TableHead>Bookmarks</TableHead>
                    <TableHead>Quick Access</TableHead>
                    <TableHead className="hidden md:table-cell">Created</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedCollections.map((collection) => (
                    <TableRow key={collection.id}>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => toggleQuickAccess(collection.id)}
                        >
                          <StarIcon
                            className={`h-4 w-4 ${collection.isQuickAccess ? "fill-yellow-400 text-yellow-400" : ""}`}
                          />
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/app/bookmark/collections/${collection.titleLower}`}
                          className="font-medium hover:underline"
                          onClick={() => incrementUsageCount(collection.id)}
                        >
                          {collection.title}
                        </Link>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="text-sm text-muted-foreground">
                          {collection.description || "No description"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{collection.bookmarkCount}</Badge>
                      </TableCell>
                      <TableCell>
                        {collection.isQuickAccess ? "Yes" : "No"}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="text-sm text-muted-foreground">
                          {new Date(collection.createdAt).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            asChild
                          >
                            <Link
                              href={`/app/bookmark/collections/${collection.titleLower}`}
                              onClick={() => incrementUsageCount(collection.id)}
                            >
                              <ArrowRightIcon className="h-4 w-4" />
                            </Link>
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontalIcon className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => toggleQuickAccess(collection.id)}
                              >
                                <StarIcon className="h-4 w-4 mr-2" />
                                {collection.isQuickAccess
                                  ? "Remove from Quick Access"
                                  : "Add to Quick Access"}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDeleteCollection(collection.id)}
                              >
                                <TrashIcon className="h-4 w-4 mr-2" />
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
        </div>

        {/* Fixed Pagination Section */}
        {filteredCollections.length > 0 && (
          <div className="flex-shrink-0 mt-8">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
                <span className="font-medium">{Math.min(endIndex, filteredCollections.length)}</span> of{" "}
                <span className="font-medium">{filteredCollections.length}</span> collections
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
        )}
      </main>
    </div>
  );
}