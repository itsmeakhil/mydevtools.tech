'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { sidebarData } from "../../components/sidebar/data/sidebar-data";
import useAuth from "@/utils/useAuth";
import Link, { LinkProps } from "next/link";
import { Heart, Search, X, Clock } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { requiresAuth } from '@/lib/tool-config';
import { useFavoriteTool } from '@/hooks/use-favorite-tool';
import { useToolUsage } from '@/hooks/use-tool-usage';
import { searchTools, filterToolsByCategory, getAllCategories, getAllToolsMetadata } from '@/lib/tools-registry';

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

// Auth requirements are now centralized in tool-config.ts

const DashboardPage: React.FC = () => {
  const { user, loading } = useAuth(false); // Dashboard is public
  const { favorites, isFavorite, toggleFavorite, isLoading: favoritesLoading } = useFavoriteTool();
  const { getRecentlyUsedTools } = useToolUsage();
  const [favoriteItems, setFavoriteItems] = useState<FavoriteItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [recentlyUsedItems, setRecentlyUsedItems] = useState<FavoriteItem[]>([]);

  // Get all tools metadata
  const allToolsMetadata = useMemo(() => getAllToolsMetadata(), []);
  const categories = useMemo(() => getAllCategories(), []);

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
  }, []); // Only run once on mount, getRecentlyUsedTools reads from localStorage which doesn't trigger re-renders

  // Filter tools based on search and category
  const filteredGroups = useMemo(() => {
    let filtered = sidebarData.navGroups;

    // If search query exists, filter by search
    if (searchQuery.trim()) {
      const searchResults = searchTools(searchQuery, allToolsMetadata);
      const searchUrls = new Set(searchResults.map(t => t.url));
      
      filtered = sidebarData.navGroups.map(group => ({
        ...group,
        items: group.items.map(item => {
          if (!item.items) {
            // Top-level item
            if (item.url && searchUrls.has(item.url.toString())) {
              return item;
            }
            return null;
          } else {
            // Nested items
            const filteredSubItems = item.items.filter(subItem => 
              subItem.url && searchUrls.has(subItem.url.toString())
            );
            if (filteredSubItems.length > 0) {
              return { ...item, items: filteredSubItems };
            }
            return null;
          }
        }).filter(Boolean) as typeof group.items,
      })).filter(group => group.items.length > 0);
    }

    // Filter by category if selected
    if (selectedCategory) {
      const categoryResults = filterToolsByCategory(selectedCategory, allToolsMetadata);
      const categoryUrls = new Set(categoryResults.map(t => t.url));
      
      filtered = filtered.map(group => ({
        ...group,
        items: group.items.map(item => {
          if (!item.items) {
            if (item.url && categoryUrls.has(item.url.toString())) {
              return item;
            }
            return null;
          } else {
            const filteredSubItems = item.items.filter(subItem => 
              subItem.url && categoryUrls.has(subItem.url.toString())
            );
            if (filteredSubItems.length > 0) {
              return { ...item, items: filteredSubItems };
            }
            return null;
          }
        }).filter(Boolean) as typeof group.items,
      })).filter(group => group.items.length > 0);
    }

    return filtered;
  }, [searchQuery, selectedCategory, allToolsMetadata]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // Component for rendering a tool card
  const ToolCard = ({ item, id }: { item: ToolItem, id: string }) => {
    const itemRequiresAuth = item.url ? requiresAuth(item.url.toString()) : false;

    const handleClick = (e: React.MouseEvent) => {
      if (itemRequiresAuth && !user) {
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
                className={`cursor-pointer ${isFavorite(id)
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
        {/* Search and Filter Section */}
        <section className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search tools by name, description, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                onClick={() => setSearchQuery('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-muted-foreground">Filter by category:</span>
            <Button
              variant={selectedCategory === '' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('')}
            >
              All
            </Button>
            {categories.slice(0, 8).map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
            {categories.length > 8 && (
              <Badge variant="secondary" className="ml-2">
                +{categories.length - 8} more
              </Badge>
            )}
          </div>

          {/* Active filters display */}
          {(searchQuery || selectedCategory) && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {searchQuery && (
                <Badge variant="secondary" className="gap-1">
                  Search: "{searchQuery}"
                  <button
                    onClick={() => setSearchQuery('')}
                    className="ml-1 hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {selectedCategory && (
                <Badge variant="secondary" className="gap-1">
                  Category: {selectedCategory}
                  <button
                    onClick={() => setSelectedCategory('')}
                    className="ml-1 hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </section>

        {/* Recently Used Tools - Only for authenticated users */}
        {user && recentlyUsedItems.length > 0 && !searchQuery && !selectedCategory && (
          <section className="space-y-4 mb-12">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-1 w-6 bg-muted dark:bg-muted rounded-full" />
              <h2 className="text-xl font-semibold text-foreground dark:text-foreground flex items-center">
                <Clock className="mr-2 text-foreground dark:text-foreground" size={16} />
                Recently Used
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {recentlyUsedItems.map((item) => (
                <ToolCard key={`recent-${item.id}`} item={item} id={item.id} />
              ))}
            </div>
          </section>
        )}

        {/* Favorites Section - Only for authenticated users */}
        {user && favorites.length > 0 && !searchQuery && !selectedCategory && (
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
        {filteredGroups.length > 0 ? (
          <div className="space-y-8">
            {filteredGroups.map((group, groupIndex) => (
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
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              No tools found matching your search criteria.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('');
              }}
            >
              Clear filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;