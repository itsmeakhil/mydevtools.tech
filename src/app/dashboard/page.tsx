'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { sidebarData } from "../../components/sidebar/data/sidebar-data";
import useAuth from "@/utils/useAuth";
import Link, { LinkProps } from "next/link";
import { Heart } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../database/firebase';

// Define types for our items
interface ToolItem {
  title: string;
  url?: LinkProps['href'];
  icon?: React.ElementType;
  badge?: string;
  description?: string;
  items?: ToolItem[];
  customUI?: boolean;
}

interface FavoriteItem extends ToolItem {
  id: string;
}

// Helper function to create a unique ID for each item
const createItemId = (groupIndex: number, itemIndex: number, subIndex: number | null = null): string => {
  return subIndex !== null
    ? `${groupIndex}-${itemIndex}-${subIndex}`
    : `${groupIndex}-${itemIndex}`;
};

// Helper function to find an item by its ID
const findItemById = (id: string): ToolItem | undefined => {
  const [groupIndexStr, itemIndexStr, subIndexStr] = id.split('-');
  const groupIndex = parseInt(groupIndexStr);
  const itemIndex = parseInt(itemIndexStr);
  const subIndex = subIndexStr ? parseInt(subIndexStr) : undefined;

  if (isNaN(groupIndex) || isNaN(itemIndex) || groupIndex >= sidebarData.navGroups.length) {
    return undefined;
  }

  const group = sidebarData.navGroups[groupIndex];
  if (!group || itemIndex >= group.items.length) {
    return undefined;
  }

  if (subIndex !== undefined && !isNaN(subIndex)) {
    const parentItem = group.items[itemIndex];
    return parentItem.items && subIndex < parentItem.items.length
      ? parentItem.items[subIndex]
      : undefined;
  } else {
    return group.items[itemIndex];
  }
};

// List of General Tools that require authentication
const authRequiredUrls = [
  '/app/to-do',    // Tasks
  '/app/notes',    // Notes
  '/app/url-shortener', // URL Shortener
  '/app/bookmark', // Bookmark
];

const DashboardPage: React.FC = () => {
  const { user, loading } = useAuth(false); // Dashboard is public
  const [favorites, setFavorites] = useState<string[]>([]);
  const [favoriteItems, setFavoriteItems] = useState<FavoriteItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [initialized, setInitialized] = useState<boolean>(false);

  // Load favorites from Firebase for authenticated users only
  useEffect(() => {
    const loadFavorites = async () => {
      if (user?.uid) {
        setIsLoading(true);
        try {
          const userFavoritesRef = doc(db, 'users', user.uid, 'userData', 'favorites');
          const favoritesDoc = await getDoc(userFavoritesRef);

          if (favoritesDoc.exists()) {
            const userData = favoritesDoc.data();
            setFavorites(userData.toolFavorites || []);
          } else {
            await setDoc(userFavoritesRef, { toolFavorites: [] });
            setFavorites([]);
          }
          setInitialized(true);
        } catch (error) {
          console.error("Error loading favorites:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setFavorites([]);
        setIsLoading(false);
      }
    };

    loadFavorites();
  }, [user?.uid]);

  // Update favoriteItems whenever favorites change
  useEffect(() => {
    const items = favorites.map(id => {
      const item = findItemById(id);
      return item ? { id, ...item } : null;
    }).filter((item): item is FavoriteItem => item !== null);

    setFavoriteItems(items);
  }, [favorites]);

  // Save favorites to Firebase whenever they change
  useEffect(() => {
    const saveFavorites = async () => {
      if (user?.uid && initialized && !isLoading) {
        try {
          const userFavoritesRef = doc(db, 'users', user.uid, 'userData', 'favorites');
          await setDoc(userFavoritesRef, { toolFavorites: favorites }, { merge: true });
        } catch (error) {
          console.error("Error saving favorites:", error);
        }
      }
    };

    saveFavorites();
  }, [favorites, user?.uid, initialized, isLoading]);

  const toggleFavorite = async (id: string) => {
    if (!user?.uid) {
      window.location.href = '/login'; // Redirect to login if not authenticated
      return;
    }

    try {
      const newFavorites = favorites.includes(id)
        ? favorites.filter(favId => favId !== id)
        : [...favorites, id];

      setFavorites(newFavorites);

      const userFavoritesRef = doc(db, 'users', user.uid, 'userData', 'favorites');
      await setDoc(userFavoritesRef, { toolFavorites: newFavorites }, { merge: true });
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // Component for rendering a tool card
  const ToolCard = ({ item, id }: { item: ToolItem, id: string }) => {
    const isFavorite = favorites.includes(id);
    const requiresAuth = authRequiredUrls.includes(item.url?.toString() || '');

    const handleClick = (e: React.MouseEvent) => {
      if (requiresAuth && !user) {
        e.preventDefault();
        window.location.href = '/login';
      }
    };

    return (
      <Link href={item.url || "#"} className="block" onClick={handleClick}>
        <Card className="bg-card dark:bg-card border border-border dark:border-border rounded-lg shadow-sm hover:shadow-md hover:border-foreground/20 transition-all duration-200 h-40 w-full relative">
          <CardContent className="p-5 h-full flex flex-col justify-between">
            <div
              className="absolute top-4 right-4 z-10"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleFavorite(id);
              }}
            >
              <Heart
                className={`cursor-pointer ${isFavorite
                  ? "text-foreground dark:text-foreground fill-foreground dark:fill-foreground"
                  : "text-muted-foreground dark:text-muted-foreground hover:text-foreground dark:hover:text-foreground"}`}
                size={18}
              />
            </div>
            <div className="flex items-center gap-2 mb-2">
              {item.icon && <item.icon className="text-muted-foreground dark:text-muted-foreground" size={28} />}
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-medium text-foreground dark:text-foreground">
                    {item.title}
                  </h3>
                  {item.badge && (
                    <span className="bg-muted dark:bg-muted text-muted-foreground dark:text-muted-foreground text-xs px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground dark:text-muted-foreground text-sm line-clamp-2">
                  {item.description || "Explore this tool for better functionality."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  };

  return (
    <div className="min-h-screen p-6 bg-background dark:bg-background text-foreground dark:text-foreground transition-colors duration-200">
      <div className="max-w-7xl mx-auto">
        {/* Favorites Section - Only for authenticated users */}
        {user && favorites.length > 0 && (
          <section className="space-y-4 mb-12">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-1 w-6 bg-muted dark:bg-muted rounded-full" />
              <h2 className="text-xl font-semibold text-foreground dark:text-foreground flex items-center">
                Your favorite tools
                <Heart className="ml-2 text-foreground dark:text-foreground" size={16} />
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {favoriteItems.map((item) => (
                <ToolCard key={`fav-${item.id}`} item={item} id={item.id} />
              ))}
            </div>
          </section>
        )}

        {/* All Tools Section */}
        <div className="space-y-8">
          {sidebarData.navGroups.map((group, groupIndex) => (
            <section key={groupIndex} className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-1 w-6 bg-muted dark:bg-muted rounded-full" />
                <h2 className="text-xl font-semibold text-foreground dark:text-foreground">
                  {group.title}
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {group.items.map((item, itemIndex) => (
                  <React.Fragment key={`${groupIndex}-${itemIndex}`}>
                    {/* Render top-level items */}
                    {!item.items && (
                      <ToolCard
                        item={item}
                        id={createItemId(groupIndex, itemIndex)}
                      />
                    )}

                    {/* Render nested items directly in the grid */}
                    {item.items && item.items.map((subItem, subIndex) => (
                      <ToolCard
                        key={`${groupIndex}-${itemIndex}-${subIndex}`}
                        item={{ ...subItem, icon: item.icon }}
                        id={createItemId(groupIndex, itemIndex, subIndex)}
                      />
                    ))}
                  </React.Fragment>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;