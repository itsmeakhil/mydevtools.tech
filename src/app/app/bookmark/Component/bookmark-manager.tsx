"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { db, auth } from "../../../../database/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, addDoc, doc, updateDoc, increment, onSnapshot, getDocs } from "firebase/firestore";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookmarkIcon,
  FolderIcon,
  TagIcon,
  PlusIcon,
  ExternalLinkIcon,
  StarIcon,
  TrendingUpIcon,
  ClockIcon,
  ArrowRightIcon,
} from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import BookmarkImporter from "./BookmarkImportDialog";
import RecentBookmarks from "./RecentBookmarks"; // Import the updated component

// Define TypeScript interfaces for type safety
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

interface Collection {
  id: string;
  title: string;
  description: string;
  count: number;
  previewLinks: { title: string; url: string; domain: string; favicon: string }[];
  color: string;
}

interface Tag {
  tag: string;
  count: number;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newBookmark, setNewBookmark] = useState({
    url: "",
    title: "",
    description: "",
    collection: "",
    tags: "",
    isFavorite: false,
  });
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [userCollections, setUserCollections] = useState<Collection[]>([]); // For dropdown
  const [popularTags, setPopularTags] = useState<Tag[]>([]);

  // Monitor authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Fetch collections from Firestore for the dropdown
  useEffect(() => {
    if (!user) {
      setUserCollections([]);
      return;
    }

    const fetchCollections = async () => {
      try {
        const collectionsRef = collection(db, `users/${user.uid}/collections`);
        const snapshot = await getDocs(collectionsRef);
        const fetchedCollections: Collection[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          title: doc.data().title,
          description: doc.data().description,
          count: doc.data().bookmarkCount || 0,
          previewLinks: doc.data().previewLinks || [],
          color: doc.data().color || "bg-blue-500",
        }));
        setUserCollections(fetchedCollections);
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
        const updatedBookmarks = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          tags: doc.data().tags || [],
        })) as Bookmark[];
        setBookmarks(updatedBookmarks);
      },
      (error) => {
        console.error("Error listening to bookmarks: ", error);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Compute collections dynamically for display
  useEffect(() => {
    const computeCollections = () => {
      const collectionMap: { [key: string]: Collection } = {};

      bookmarks.forEach((bookmark) => {
        const collName = bookmark.collection || "Uncategorized";
        const collKey = collName.toLowerCase();

        if (collName === "Uncategorized") return; // Skip Uncategorized for display

        if (!collectionMap[collKey]) {
          const userCollection = userCollections.find(
            (c) => c.title.toLowerCase() === collKey
          );
          collectionMap[collKey] = {
            id: userCollection?.id || collKey,
            title: collName,
            description: userCollection?.description || `${collName} resources`,
            count: 0,
            previewLinks: [],
            color: userCollection?.color || "bg-blue-500",
          };
        }

        collectionMap[collKey].count += 1;
        if (collectionMap[collKey].previewLinks.length < 3) {
          collectionMap[collKey].previewLinks.push({
            title: bookmark.title,
            url: bookmark.url,
            domain: new URL(bookmark.url).hostname,
            favicon: bookmark.favicon || "/placeholder.svg",
          });
        }
      });

      const newCollections = Object.values(collectionMap);
      setCollections(newCollections);
    };

    computeCollections();
  }, [bookmarks, userCollections]);

  // Compute popular tags dynamically
  useEffect(() => {
    const computeTags = () => {
      const tagMap: { [key: string]: number } = {};

      bookmarks.forEach((bookmark) => {
        bookmark.tags.forEach((tag: string) => {
          tagMap[tag] = (tagMap[tag] || 0) + 1;
        });
      });

      const tagsArray = Object.entries(tagMap)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setPopularTags(tagsArray);
    };

    computeTags();
  }, [bookmarks]);

  // Memoize bookmark computations for performance
  const frequentBookmarks = useMemo(
    () => bookmarks.sort((a, b) => (b.visitCount || 0) - (a.visitCount || 0)).slice(0, 3),
    [bookmarks]
  );

  const recentBookmarks = useMemo(
    () => bookmarks.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()),
    [bookmarks]
  );

  const favoriteBookmarks = useMemo(
    () => bookmarks.filter((bookmark) => bookmark.isFavorite),
    [bookmarks]
  );

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setNewBookmark((prev) => ({ ...prev, [id]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setNewBookmark((prev) => ({ ...prev, isFavorite: checked }));
  };

  const handleSelectChange = (value: string) => {
    setNewBookmark((prev) => ({ ...prev, collection: value }));
  };

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
        lastVisited: null,
        favicon: url
          ? `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}`
          : "/placeholder.svg",
      };

      const userBookmarksRef = collection(db, `users/${user.uid}/bookmarks`);
      await addDoc(userBookmarksRef, bookmark);

      if (newBookmark.collection && newBookmark.collection !== "Uncategorized") {
        const selectedCollection = userCollections.find(
          (c) => c.title.toLowerCase() === newBookmark.collection.toLowerCase()
        );
        if (selectedCollection) {
          const collectionRef = doc(db, `users/${user.uid}/collections`, selectedCollection.id);
          const updatedPreviewLinks = [
            ...(selectedCollection.previewLinks || []),
            {
              title: newBookmark.title,
              url: newBookmark.url,
              domain: new URL(newBookmark.url).hostname,
              favicon: bookmark.favicon,
            },
          ].slice(0, 3);

          await updateDoc(collectionRef, {
            bookmarkCount: increment(1),
            previewLinks: updatedPreviewLinks,
          });
        }
      }

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

  const incrementVisitCount = async (bookmarkId: string) => {
    if (!user) return;

    try {
      const bookmarkRef = doc(db, `users/${user.uid}/bookmarks`, bookmarkId);
      await updateDoc(bookmarkRef, {
        visitCount: increment(1),
        lastVisited: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error incrementing visit count: ", error);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <main className="flex-1 p-4 sm:p-6">
        <div className="flex items-center justify-end mb-6">
          <div className="flex gap-4">
            <BookmarkImporter user={user} userCollections={userCollections} />
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
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="Bookmark title"
                      value={newBookmark.title}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Bookmark description"
                      value={newBookmark.description}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="collection">Collection</Label>
                    <Select onValueChange={handleSelectChange}>
                      <SelectTrigger id="collection">
                        <SelectValue placeholder="Select a collection" />
                      </SelectTrigger>
                      <SelectContent>
                        {userCollections.map((collection) => (
                          <SelectItem key={collection.id} value={collection.title}>
                            {collection.title}
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
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-2">
                    <Switch
                      id="favorite"
                      checked={newBookmark.isFavorite}
                      onCheckedChange={handleSwitchChange}
                    />
                    <Label htmlFor="favorite">Mark as favorite</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" onClick={handleAddBookmark}>
                    Add Bookmark
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats cards - Made responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="cursor-pointer">
            <Link href="/app/bookmark/bookmarks">
              <CardContent className="p-4 sm:p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Total Bookmarks</h3>
                    <p className="text-2xl sm:text-3xl font-bold mt-1">{bookmarks.length}</p>
                    <p className="text-xs text-muted-foreground mt-1">+12 from last week</p>
                  </div>
                  <BookmarkIcon className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Link>
          </Card>
          <Card className="cursor-pointer">
            <Link href="/app/bookmark/collections">
              <CardContent className="p-4 sm:p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Collections</h3>
                    <p className="text-2xl sm:text-3xl font-bold mt-1">{collections.length}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {collections.filter((c) => c.count > 0).length} active collections
                    </p>
                  </div>
                  <FolderIcon className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Link>
          </Card>
          <Card className="cursor-pointer">
            <Link href="/app/bookmark/tags">
              <CardContent className="p-4 sm:p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Tags</h3>
                    <p className="text-2xl sm:text-3xl font-bold mt-1">
                      {Object.keys(
                        bookmarks.reduce((acc: { [key: string]: boolean }, bookmark) => {
                          bookmark.tags.forEach((tag: string) => {
                            acc[tag] = true;
                          });
                          return acc;
                        }, {})
                      ).length}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Most used: {popularTags[0]?.tag || "N/A"}
                    </p>
                  </div>
                  <TagIcon className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Link>
          </Card>
          <Card className="cursor-pointer">
            <Link href="">
              <CardContent className="p-4 sm:p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Recent Activity</h3>
                    <p className="text-2xl sm:text-3xl font-bold mt-1">
                      {
                        bookmarks.filter(
                          (bookmark) =>
                            new Date(bookmark.dateAdded) >=
                            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                        ).length
                      }
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Added this week</p>
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-muted-foreground"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
              </CardContent>
            </Link>
          </Card>
        </div>

        {/* Frequently Used Bookmarks - Made responsive */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                  <TrendingUpIcon className="h-5 w-5 text-primary" />
                  Frequently Used Bookmarks
                </CardTitle>
                <CardDescription>Your most visited bookmarks for quick access</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/app/bookmark/bookmarks">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {frequentBookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                className="group relative flex flex-col rounded-lg border p-4 hover:border-primary transition-colors"
              >
                <div className="absolute top-3 right-3 flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <StarIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
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
                <div className="flex items-start gap-3 mb-2">
                  <div className="w-8 h-8 rounded-md overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center">
                    <Image
                      src={bookmark.favicon || "/placeholder.svg"}
                      alt={`${bookmark.title} favicon`}
                      width={20}
                      height={20}
                      className="w-5 h-5"
                    />
                  </div>
                  <div className="flex-1 min-w-0 pr-8">
                    <Link
                      href={bookmark.url}
                      target="_blank"
                      onClick={() => incrementVisitCount(bookmark.id)}
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
                  {bookmark.tags.map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <ClockIcon className="h-3 w-3" />
                    <span>
                      {bookmark.lastVisited
                        ? new Date(bookmark.lastVisited).toLocaleString()
                        : "Not visited"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUpIcon className="h-3 w-3" />
                    <span>{bookmark.visitCount || 0} visits</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
          <CardFooter className="pt-0 pb-4 px-6">
            <Button variant="ghost" size="sm" className="ml-auto" asChild>
              <Link href="/app/bookmark/bookmarks">See all bookmarks</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Combined Recent, Favorites, and Popular Bookmarks Section */}
        <RecentBookmarks
          recentBookmarks={recentBookmarks}
          favoriteBookmarks={favoriteBookmarks}
          popularBookmarks={frequentBookmarks}
          incrementVisitCount={incrementVisitCount}
        />

        {/* Popular Tags - Made responsive */}
        <Card className="mb-6 mt-6">
          <CardContent className="p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-semibold mb-4">Popular Tags</h3>
            <div className="flex flex-wrap gap-2">
              {popularTags.map(({ tag, count }: { tag: string; count: number }) => (
                <Badge key={tag} variant="outline" className="px-3 py-1">
                  {tag} ({count})
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Collections with Preview Links - Made responsive */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
                <FolderIcon className="h-5 w-5 text-primary" />
                Collections
              </h2>
              <p className="text-sm text-muted-foreground">Your organized bookmark collections</p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/app/bookmark/collections" className="flex items-center gap-1">
                View all collections
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {collections.map((collection) => (
              <Card
                key={collection.id}
                className="group overflow-hidden transition-all hover:shadow-md border-transparent hover:border-primary"
              >
                <Link
                  href={`/bookmark/collections/${collection.title.toLowerCase()}`}
                  className="block"
                >
                  <CardHeader
                    className={`p-4 ${collection.color} bg-opacity-10 border-b relative overflow-hidden`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
                        {collection.title}
                        <Badge variant="secondary" className="rounded-full px-2.5 ml-2">
                          {collection.count}
                        </Badge>
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <StarIcon className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardDescription className="mt-1">{collection.description}</CardDescription>
                  </CardHeader>
                </Link>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {collection.previewLinks.map((link: { title: string; url: string; domain: string; favicon: string }, index: number) => (
                      <Link
                        key={index}
                        href={link.url}
                        target="_blank"
                        onClick={() => {
                          const bookmark = bookmarks.find((b) => b.url === link.url);
                          if (bookmark) incrementVisitCount(bookmark.id);
                        }}
                        className="flex items-center gap-3 p-3 hover:bg-accent transition-colors group/link"
                      >
                        <div className="w-8 h-8 rounded-md overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center">
                          <Image
                            src={link.favicon || "/placeholder.svg"}
                            alt={`${link.title} favicon`}
                            width={20}
                            height={20}
                            className="w-5 h-5"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium line-clamp-1 group-hover/link:text-primary transition-colors">
                            {link.title}
                          </div>
                          <p className="text-xs text-muted-foreground">{link.domain}</p>
                        </div>
                        <ExternalLinkIcon className="h-4 w-4 text-muted-foreground opacity-0 group-hover/link:opacity-100 transition-opacity" />
                      </Link>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="p-4 flex justify-between items-center border-t bg-muted/20">
                  <span className="text-xs text-muted-foreground">{collection.count} bookmarks</span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                    asChild
                  >
                    <Link href={`/app/bookmark/collections/${collection.title.toLowerCase()}`}>
                      View all
                      <ArrowRightIcon className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}