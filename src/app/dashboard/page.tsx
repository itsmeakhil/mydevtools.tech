'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { sidebarData } from "../../components/sidebar/data/sidebar-data";
import useAuth from "@/utils/useAuth";
import Link, { LinkProps } from "next/link";
import { Heart, Clock, Search, ArrowRight, Sparkles } from 'lucide-react';
import { requiresAuth } from '@/lib/tool-config';
import { useFavoriteTool } from '@/hooks/use-favorite-tool';
import { useToolUsage } from '@/hooks/use-tool-usage';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from "@/components/ui/input";

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

const DashboardPage: React.FC = () => {
  // const { user, loading } = useAuth(true); // Dashboard is private
  const loading = false;
  const user = { displayName: "Test User", email: "test@example.com", uid: "test-uid" };
  const { favorites, isFavorite, toggleFavorite } = useFavoriteTool();
  const { getRecentlyUsedTools } = useToolUsage();
  const [favoriteItems, setFavoriteItems] = useState<FavoriteItem[]>([]);
  const [recentlyUsedItems, setRecentlyUsedItems] = useState<FavoriteItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Update favoriteItems whenever favorites change
  useEffect(() => {
    const items = favorites.map(id => {
      const item = findItemById(id);
      return item ? { id, ...item } : null;
    }).filter((item): item is FavoriteItem => item !== null);

    setFavoriteItems(items);
  }, [favorites]);

  // Get recently used tools
  useEffect(() => {
    const recent = getRecentlyUsedTools(5);
    const items = recent.map(usage => {
      const item = findItemById(usage.toolId);
      return item ? { id: usage.toolId, ...item } : null;
    }).filter((item): item is FavoriteItem => item !== null);

    setRecentlyUsedItems(items);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter tools based on search query
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return sidebarData.navGroups;

    const query = searchQuery.toLowerCase();
    return sidebarData.navGroups.map(group => {
      const filteredItems = group.items.reduce<any[]>((acc, item, itemIndex) => {
        // Check top-level item
        const matchesItem =
          item.title.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query);

        // Check nested items
        const matchingSubItems = item.items?.filter((subItem, subIndex) =>
          subItem.title.toLowerCase().includes(query) ||
          subItem.description?.toLowerCase().includes(query)
        ).map((subItem, subIndex) => ({
          ...subItem,
          originalId: createItemId(sidebarData.navGroups.indexOf(group), itemIndex, subIndex),
          icon: item.icon // Inherit icon if missing
        })) || [];

        if (matchesItem && !item.items) {
          acc.push({
            ...item,
            originalId: createItemId(sidebarData.navGroups.indexOf(group), itemIndex)
          });
        } else if (matchingSubItems.length > 0) {
          acc.push(...matchingSubItems);
        }

        return acc;
      }, []);

      return {
        ...group,
        items: filteredItems
      };
    }).filter(group => group.items.length > 0);
  }, [searchQuery]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 bg-muted rounded-full"></div>
          <div className="h-4 w-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  // Component for rendering a tool card
  const ToolCard = ({ item, id, index }: { item: ToolItem, id: string, index: number }) => {
    const itemRequiresAuth = item.url ? requiresAuth(item.url.toString()) : false;

    const handleClick = (e: React.MouseEvent) => {
      if (itemRequiresAuth && !user) {
        e.preventDefault();
        window.location.href = '/login';
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
      >
        <Link href={item.url || "#"} className="block group h-full" onClick={handleClick}>
          <Card className="bg-card/50 dark:bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 hover:bg-card hover:shadow-lg transition-all duration-300 h-full min-h-[200px] relative overflow-hidden group-hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <CardContent className="p-6 h-full flex flex-col justify-between relative z-10">
              <div className="flex justify-between items-start mb-3">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-300">
                  {item.icon ? <item.icon size={24} /> : <Sparkles size={24} />}
                </div>
                <div
                  className="p-1.5 rounded-full hover:bg-muted/80 transition-colors z-20"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleFavorite(id);
                  }}
                >
                  <Heart
                    className={`transition-all duration-300 ${isFavorite(id)
                      ? "text-red-500 fill-red-500 scale-110"
                      : "text-muted-foreground hover:text-red-500"}`}
                    size={18}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  {item.badge && (
                    <span className="bg-primary/10 text-primary text-[10px] font-medium px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {item.badge}
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground text-sm line-clamp-2 mb-4 group-hover:text-muted-foreground/80 transition-colors">
                  {item.description || "Explore this tool for better functionality."}
                </p>
              </div>

              <div className="mt-auto flex items-center text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-[-10px] group-hover:translate-x-0">
                Launch Tool <ArrowRight size={12} className="ml-1" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen px-6 pb-8 md:px-8 md:pb-12 bg-background/50">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Welcome back{user?.displayName ? `, ${user.displayName.split(' ')[0]}` : ''}
            </h1>
            <p className="text-muted-foreground text-lg">
              What would you like to build today?
            </p>
          </div>

          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            <Input
              type="text"
              placeholder="Search tools..."
              className="pl-10 h-12 bg-card/50 backdrop-blur-sm border-border/50 focus:border-primary/50 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Recently Used Tools - Only show when no search query */}
        {!searchQuery && user && recentlyUsedItems.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
                <Clock size={18} />
              </div>
              <h2 className="text-xl font-semibold">Recently Used</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentlyUsedItems.map((item, index) => (
                <ToolCard key={`recent-${item.id}`} item={item} id={item.id} index={index} />
              ))}
            </div>
          </section>
        )}

        {/* Favorites Section - Only show when no search query */}
        {!searchQuery && user && favorites.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-red-500/10 text-red-500">
                <Heart size={18} />
              </div>
              <h2 className="text-xl font-semibold">Favorites</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {favoriteItems.map((item, index) => (
                <ToolCard key={`fav-${item.id}`} item={item} id={item.id} index={index} />
              ))}
            </div>
          </section>
        )}

        {/* All Tools / Search Results */}
        <div className="space-y-6">
          {filteredGroups.length > 0 ? (
            filteredGroups.map((group, groupIndex) => (
              <section key={groupIndex} className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                    {group.icon ? <group.icon size={18} /> : <Sparkles size={18} />}
                  </div>
                  <h2 className="text-xl font-semibold">{group.title}</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {group.items.map((item: any, itemIndex) => (
                    <React.Fragment key={`${groupIndex}-${itemIndex}`}>
                      {/* Render top-level items */}
                      {!item.items && !item.originalId && (
                        <ToolCard
                          item={item}
                          id={createItemId(sidebarData.navGroups.indexOf(group), itemIndex)}
                          index={itemIndex}
                        />
                      )}

                      {/* Render search result items (flattened) */}
                      {item.originalId && (
                        <ToolCard
                          item={item}
                          id={item.originalId}
                          index={itemIndex}
                        />
                      )}

                      {/* Render nested items directly in the grid (only when not searching) */}
                      {!searchQuery && item.items && item.items.map((subItem: ToolItem, subIndex: number) => (
                        <ToolCard
                          key={`${groupIndex}-${itemIndex}-${subIndex}`}
                          item={{ ...subItem, icon: item.icon }}
                          id={createItemId(sidebarData.navGroups.indexOf(group), itemIndex, subIndex)}
                          index={subIndex}
                        />
                      ))}
                    </React.Fragment>
                  ))}
                </div>
              </section>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="p-4 rounded-full bg-muted mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No tools found</h3>
              <p className="text-muted-foreground max-w-sm">
                We couldn't find any tools matching "{searchQuery}". Try searching for something else.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;