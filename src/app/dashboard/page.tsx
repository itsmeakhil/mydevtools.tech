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

const DashboardPage: React.FC = () => {
  const user = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [favoriteItems, setFavoriteItems] = useState<FavoriteItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [initialized, setInitialized] = useState<boolean>(false);

  // Load favorites from Firebase on component mount or when user changes
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
            // Initialize empty favorites if document doesn't exist
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
        // Reset favorites when user is not logged in
        setFavorites([]);
        setIsLoading(false);
      }
    };

    loadFavorites();
  }, [user?.uid]); // Only re-run when user.uid changes

  // Update favoriteItems whenever favorites change
  useEffect(() => {
    const items = favorites.map(id => {
      const item = findItemById(id);
      return item ? {
        id,
        ...item
      } : null;
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
    if (!user?.uid) return;
    
    try {
      const newFavorites = favorites.includes(id)
        ? favorites.filter(favId => favId !== id)
        : [...favorites, id];
      
      setFavorites(newFavorites);
      
      // Immediately update Firebase
      const userFavoritesRef = doc(db, 'users', user.uid, 'userData', 'favorites');
      await setDoc(userFavoritesRef, { toolFavorites: newFavorites }, { merge: true });
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  if (!user) {
    return null;
  }

  // Component for rendering a tool card
  const ToolCard = ({ item, id }: { item: ToolItem, id: string }) => {
    const isFavorite = favorites.includes(id);
    
    return (
      <Link href={item.url || "#"} className="block">
        <Card className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm hover:shadow-md hover:border-gray-400 dark:hover:border-gray-600 transition-all duration-200 h-40 w-full relative">
          <CardContent className="p-5 h-full">
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
                  ? "text-black dark:text-white fill-black dark:fill-white" 
                  : "text-gray-300 dark:text-gray-700 hover:text-black dark:hover:text-white"}`} 
                size={18} 
              />
            </div>
            <div className="flex flex-col h-full">
              <div className="mb-3">
                {item.icon && <item.icon className="text-gray-500 dark:text-gray-400" size={28} />}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-medium text-black dark:text-white">
                    {item.title}
                  </h3>
                  {item.badge && (
                    <span className="bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 text-xs px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-2">
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
    <div className="min-h-screen p-6 bg-white dark:bg-black text-black dark:text-white transition-colors duration-200">
      <div className="max-w-7xl mx-auto">
        {/* Favorites Section */}
        {favorites.length > 0 && (
          <section className="space-y-4 mb-12">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-1 w-6 bg-gray-500 dark:bg-gray-400 rounded-full" />
              <h2 className="text-xl font-semibold text-black dark:text-white flex items-center">
                Your favorite tools
                <Heart className="ml-2 text-black dark:text-white" size={16} />
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
                <div className="h-1 w-6 bg-gray-500 dark:bg-gray-400 rounded-full" />
                <h2 className="text-xl font-semibold text-black dark:text-white">
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
                        item={{...subItem, icon: item.icon}} 
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