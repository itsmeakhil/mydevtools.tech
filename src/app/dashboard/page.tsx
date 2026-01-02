'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { sidebarData } from "../../components/sidebar/data/sidebar-data";
import Link, { LinkProps } from "next/link";
import { Heart, Clock, ArrowRight, Sparkles, Layers, Zap } from 'lucide-react';
import { requiresAuth } from '@/lib/tool-config';
import { useFavoriteTool } from '@/hooks/use-favorite-tool';
import { useToolUsage } from '@/hooks/use-tool-usage';
import { motion } from 'framer-motion';
import { useMediaQuery } from "@/hooks/use-media-query";
import useAuth from "@/utils/useAuth";

// Helper function to get time-based greeting
const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

// Define types for our items
interface ToolItem {
  title: string;
  url?: LinkProps['href'];
  icon?: React.ElementType;
  badge?: string;
  description?: string;
  items?: ToolItem[];
  customUI?: boolean;
  hiddenOnMobile?: boolean;
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
  const { user, loading } = useAuth(false); // Dashboard shows for all users
  const { favorites, isFavorite, toggleFavorite } = useFavoriteTool();
  const { getRecentlyUsedTools } = useToolUsage();
  const [favoriteItems, setFavoriteItems] = useState<FavoriteItem[]>([]);
  const [recentlyUsedItems, setRecentlyUsedItems] = useState<FavoriteItem[]>([]);
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Update favoriteItems whenever favorites change
  useEffect(() => {
    const items = favorites.map(id => {
      const item = findItemById(id);
      return item ? { id, ...item } : null;
    }).filter((item): item is FavoriteItem => {
      if (!item) return false;
      if (isMobile && item.hiddenOnMobile) return false;
      return true;
    });

    setFavoriteItems(items);
  }, [favorites, isMobile]);

  // Get recently used tools
  useEffect(() => {
    const recent = getRecentlyUsedTools(5);
    const items = recent.map(usage => {
      const item = findItemById(usage.toolId);
      return item ? { id: usage.toolId, ...item } : null;
    }).filter((item): item is FavoriteItem => {
      if (!item) return false;
      if (isMobile && item.hiddenOnMobile) return false;
      return true;
    });

    setRecentlyUsedItems(items);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile]);

  // Filter tools based on search query
  const filteredGroups = useMemo(() => {
    // First filter by mobile visibility if needed
    const mobileFilteredGroups = sidebarData.navGroups.map(group => {
      if (isMobile && group.hiddenOnMobile) return null;

      const visibleItems = group.items.filter(item => !(isMobile && item.hiddenOnMobile));
      if (visibleItems.length === 0) return null;

      return {
        ...group,
        items: visibleItems
      };
    }).filter((group): group is typeof sidebarData.navGroups[0] => group !== null);

    return mobileFilteredGroups;
  }, [isMobile]);

  // Calculate total tools count
  const totalTools = useMemo(() => {
    return sidebarData.navGroups.reduce((acc, group) => {
      return acc + group.items.reduce((itemAcc, item) => {
        return itemAcc + (item.items ? item.items.length : 1);
      }, 0);
    }, 0);
  }, []);

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
        className="card-gradient-border rounded-xl"
      >
        <Link href={item.url || "#"} className="block group h-full" onClick={handleClick}>
          <Card className="glass-card border-border/30 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 h-full min-h-[180px] relative overflow-hidden group-hover:-translate-y-1.5">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <CardContent className="p-5 h-full flex flex-col justify-between relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 text-primary group-hover:scale-110 transition-all duration-300 icon-container-pulse">
                  {item.icon ? <item.icon size={22} strokeWidth={1.5} /> : <Sparkles size={22} strokeWidth={1.5} />}
                </div>
                <div
                  className="p-2 rounded-full hover:bg-muted/80 transition-colors z-20 cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleFavorite(id);
                  }}
                >
                  <Heart
                    className={`transition-all duration-300 ${isFavorite(id)
                      ? "text-red-500 fill-red-500 scale-110"
                      : "text-muted-foreground/60 hover:text-red-500"}`}
                    size={16}
                  />
                </div>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  {item.badge && (
                    <span className="bg-gradient-to-r from-primary/20 to-primary/10 text-primary text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider border border-primary/20">
                      {item.badge}
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground/80 text-sm line-clamp-2 group-hover:text-muted-foreground transition-colors">
                  {item.description || "Explore this tool for better functionality."}
                </p>
              </div>

              <div className="mt-3 flex items-center text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-[-10px] group-hover:translate-x-0">
                Launch Tool <ArrowRight size={12} className="ml-1.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen px-6 pb-8 md:px-8 md:pb-12 bg-background/50 dashboard-grid-bg">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                {getGreeting()}
              </p>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight gradient-text-animated">
                Welcome back{user?.displayName ? `, ${user.displayName.split(' ')[0]}` : ''}
              </h1>
              <p className="text-muted-foreground">
                What would you like to build today?
              </p>
            </div>

            {/* Quick Stats */}
            <div className="flex gap-3">
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass-card stats-glow">
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <Layers size={16} className="text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Tools</p>
                  <p className="text-sm font-semibold">{totalTools}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass-card stats-glow">
                <div className="p-1.5 rounded-lg bg-red-500/10">
                  <Heart size={16} className="text-red-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Favorites</p>
                  <p className="text-sm font-semibold">{favorites.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recently Used Tools - Only show when no search query */}
        {user && recentlyUsedItems.length > 0 && (
          <section className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 section-header-line pb-2">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                  <Clock size={18} strokeWidth={1.5} />
                </div>
                <h2 className="text-xl font-semibold">Recently Used</h2>
                <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                  {recentlyUsedItems.length}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentlyUsedItems.map((item, index) => (
                <ToolCard key={`recent-${item.id}`} item={item} id={item.id} index={index} />
              ))}
            </div>
          </section>
        )}

        {/* Favorites Section - Only show when no search query */}
        {user && favorites.length > 0 && (
          <section className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 section-header-line pb-2">
                <div className="p-2 rounded-xl bg-red-500/10 text-red-500">
                  <Heart size={18} strokeWidth={1.5} />
                </div>
                <h2 className="text-xl font-semibold">Favorites</h2>
                <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                  {favoriteItems.length}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {favoriteItems.map((item, index) => (
                <ToolCard key={`fav-${item.id}`} item={item} id={item.id} index={index} />
              ))}
            </div>
          </section>
        )}

        {/* All Tools / Search Results */}
        <div className="space-y-8">
          {filteredGroups.map((group, groupIndex) => (
            <section key={groupIndex} className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 section-header-line pb-2">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    {group.icon ? <group.icon size={18} strokeWidth={1.5} /> : <Sparkles size={18} strokeWidth={1.5} />}
                  </div>
                  <h2 className="text-xl font-semibold">{group.title}</h2>
                  <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                    {group.items.reduce((acc, item) => acc + (item.items ? item.items.length : 1), 0)}
                  </span>
                </div>
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
                    {item.items && item.items.map((subItem: ToolItem, subIndex: number) => (
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
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;