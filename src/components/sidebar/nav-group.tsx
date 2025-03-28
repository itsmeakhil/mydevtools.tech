"use client";

import { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Plus } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "../ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { NavCollapsible, NavItem, NavLink } from "./types"; // Import types
import useAuth from "@/utils/useAuth"; // Import useAuth
import { db } from "../../database/firebase"; // Adjust the path to your Firebase config
import { collection, onSnapshot, updateDoc, doc } from "firebase/firestore";

// List of URLs that require authentication (General Tools)
const authRequiredUrls = [
  "/app/to-do",
  "/app/notes",
  "/app/url-shortener",
  "/app/bookmark",
  "/app/bookmark/dashboard",
  "/app/bookmark/bookmarks",
  "/app/bookmark/collections",
  "/app/bookmark/tags",
];

// Define the Collection type (aligned with CollectionPage)
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
  bookmarks: Array<{
    id: string;
    title: string;
    description: string;
    url: string;
    domain: string;
    favicon: string;
    tags: string[];
    dateAdded: string;
    isFavorite: boolean;
  }>;
}

// CustomBookmarkLink Component
const CustomBookmarkLink = ({ item, href }: { item: NavLink; href: string }) => {
  const { user, loading } = useAuth(false); // Check auth state with loading
  const pathname = usePathname();

  const itemUrl = typeof item.url === "string" ? item.url : item.url.toString();
  const isBookmarkPage = pathname.startsWith(itemUrl);
  const isDashboardPage =
    pathname === `${itemUrl}/dashboard` || pathname === itemUrl;

  const [isOpen, setIsOpen] = useState(false);
  const [quickAccessCollections, setQuickAccessCollections] = useState<
    Collection[]
  >([]);
  const [allCollections, setAllCollections] = useState<Collection[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (isBookmarkPage) {
      setIsOpen(true);
    }
  }, [isBookmarkPage]);

  useEffect(() => {
    if (!user) {
      setQuickAccessCollections([]);
      setAllCollections([]);
      return;
    }

    const collectionsRef = collection(db, `users/${user.uid}/collections`);
    const unsubscribe = onSnapshot(
      collectionsRef,
      (snapshot) => {
        const fetchedCollections: Collection[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          title: doc.data().title,
          titleLower:
            doc.data().titleLower ||
            doc.data().title.toLowerCase().replace(/\s+/g, "-"),
          description: doc.data().description,
          bookmarkCount: doc.data().bookmarkCount || 0,
          usageCount: doc.data().usageCount || 0,
          isQuickAccess: doc.data().isQuickAccess || false,
          createdAt: doc.data().createdAt || new Date().toISOString(),
          color: doc.data().color || "bg-blue-500",
          previewLinks: doc.data().previewLinks || [],
          bookmarks: doc.data().bookmarks || [],
        }));

        setAllCollections(fetchedCollections);
        setQuickAccessCollections(
          fetchedCollections.filter((c) => c.isQuickAccess)
        );
      },
      (error) => {
        console.error("Error fetching collections:", error);
        setQuickAccessCollections([]);
        setAllCollections([]);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const requiresAuth = (url: string) => {
    if (authRequiredUrls.includes(url)) {
      return true;
    }
    if (url.startsWith("/app/bookmark/collections/")) {
      return true;
    }
    return false;
  };

  const handleClick = (e: React.MouseEvent) => {
    if (loading) {
      e.preventDefault();
      return;
    }
    if (!user && requiresAuth(itemUrl)) {
      e.preventDefault();
      window.location.href = "/login";
      return;
    }
    setIsOpen(true);
  };

  const handleSubLinkClick = (e: React.MouseEvent, subUrl: string) => {
    if (loading) {
      e.preventDefault();
      return;
    }
    if (!user && requiresAuth(subUrl)) {
      e.preventDefault();
      window.location.href = "/login";
    }
  };

  const toggleQuickAccess = async (collectionId: string) => {
    if (!user) return;

    const collectionToUpdate = allCollections.find((c) => c.id === collectionId);
    if (!collectionToUpdate) return;

    const updatedQuickAccess = !collectionToUpdate.isQuickAccess;

    try {
      await updateDoc(doc(db, `users/${user.uid}/collections`, collectionId), {
        isQuickAccess: updatedQuickAccess,
      });
    } catch (error) {
      console.error("Error updating Quick Access:", error);
    }
  };

  return (
    <Collapsible
      asChild
      open={isOpen}
      onOpenChange={setIsOpen}
      className="group/collapsible"
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            asChild
            isActive={checkIsActive(href, item)}
            tooltip={item.title}
            className="hover:bg-accent/50 text-primary"
          >
            <Link href={`${item.url}/dashboard`} onClick={handleClick}>
              {item.icon && <item.icon />}
              <span>{item.title}</span>
              <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
            </Link>
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent className="CollapsibleContent">
          <SidebarMenuSub className="p-3">
            <div className="space-y-1">
              <SidebarMenuSubItem>
                <SidebarMenuSubButton
                  asChild
                  className={`py-2 px-3 hover:bg-accent rounded-md ${
                    isDashboardPage ? "bg-accent font-medium" : ""
                  }`}
                >
                  <Link
                    href={`${item.url}/dashboard`}
                    className="flex items-center gap-2 w-full"
                    onClick={(e) =>
                      handleSubLinkClick(e, `${item.url}/dashboard`)
                    }
                  >
                    <div className="w-5 h-5 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="3" y="3" width="7" height="7" />
                        <rect x="14" y="3" width="7" height="7" />
                        <rect x="14" y="14" width="7" height="7" />
                        <rect x="3" y="14" width="7" height="7" />
                      </svg>
                    </div>
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>

              <SidebarMenuSubItem>
                <SidebarMenuSubButton
                  asChild
                  className={`py-2 px-3 hover:bg-accent rounded-md ${
                    pathname === `${item.url}/bookmarks`
                      ? "bg-accent font-medium"
                      : ""
                  }`}
                >
                  <Link
                    href={`${item.url}/bookmarks`}
                    className="flex items-center gap-2 w-full"
                    onClick={(e) =>
                      handleSubLinkClick(e, `${item.url}/bookmarks`)
                    }
                  >
                    <div className="w-5 h-5 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                      </svg>
                    </div>
                    <span>All Bookmarks</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>

              <SidebarMenuSubItem>
                <SidebarMenuSubButton
                  asChild
                  className={`py-2 px-3 hover:bg-accent rounded-md ${
                    pathname === `${item.url}/collections`
                      ? "bg-accent font-medium"
                      : ""
                  }`}
                >
                  <Link
                    href={`${item.url}/collections`}
                    className="flex items-center gap-2 w-full"
                    onClick={(e) =>
                      handleSubLinkClick(e, `${item.url}/collections`)
                    }
                  >
                    <div className="w-5 h-5 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                      </svg>
                    </div>
                    <span>Collections</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>

              <SidebarMenuSubItem>
                <SidebarMenuSubButton
                  asChild
                  className={`py-2 px-3 hover:bg-accent rounded-md ${
                    pathname === `${item.url}/tags`
                      ? "bg-accent font-medium"
                      : ""
                  }`}
                >
                  <Link
                    href={`${item.url}/tags`}
                    className="flex items-center gap-2 w-full"
                    onClick={(e) => handleSubLinkClick(e, `${item.url}/tags`)}
                  >
                    <div className="w-5 h-5 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                        <line x1="7" y1="7" x2="7.01" y2="7"></line>
                      </svg>
                    </div>
                    <span>Tags</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            </div>

            <div className="mt-4 mb-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Quick Access</h3>
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                  <DialogTrigger asChild>
                    <button
                      className="p-1 hover:bg-accent rounded-md"
                      onClick={(e) => {
                        if (
                          loading ||
                          (!user && requiresAuth(`${item.url}/add`))
                        ) {
                          e.preventDefault();
                          if (!user) window.location.href = "/login";
                        } else {
                          setIsModalOpen(true);
                        }
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Manage Quick Access</DialogTitle>
                    </DialogHeader>
                    <div className="max-h-[60vh] overflow-y-auto">
                      {allCollections.length > 0 ? (
                        allCollections.map((collection) => (
                          <div
                            key={collection.id}
                            className="flex items-center justify-between py-2 border-b"
                          >
                            <span>{collection.title}</span>
                            <div className="flex items-center space-x-2">
                              <Switch
                                id={`quick-access-${collection.id}`}
                                checked={collection.isQuickAccess}
                                onCheckedChange={() =>
                                  toggleQuickAccess(collection.id)
                                }
                              />
                              <Label htmlFor={`quick-access-${collection.id}`}>
                                {collection.isQuickAccess ? "On" : "Off"}
                              </Label>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No collections available.
                        </p>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div className="space-y-1">
              {quickAccessCollections.length > 0 ? (
                quickAccessCollections.map((collection) => (
                  <SidebarMenuSubItem key={collection.id}>
                    <SidebarMenuSubButton
                      asChild
                      className={`py-1 px-3 hover:bg-accent rounded-md ${
                        pathname ===
                        `${item.url}/collections/${collection.titleLower}`
                          ? "bg-accent font-medium"
                          : ""
                      }`}
                    >
                      <Link
                        href={`${item.url}/collections/${collection.titleLower}`}
                        className="w-full text-sm"
                        onClick={(e) =>
                          handleSubLinkClick(
                            e,
                            `${item.url}/collections/${collection.titleLower}`
                          )
                        }
                      >
                        {collection.title}
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))
              ) : (
                <SidebarMenuSubItem>
                  <span className="text-sm text-muted-foreground px-3">
                    No Quick Access collections
                  </span>
                </SidebarMenuSubItem>
              )}
            </div>
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
};

// Define the props interface for NavGroup
interface NavGroupProps {
  title: string;
  items: (NavLink | NavCollapsible)[];
}

// Main NavGroup Component
export function NavGroup({ title, items }: NavGroupProps) {
  const { state } = useSidebar();
  const pathname = usePathname();
  const { user, loading } = useAuth(false); // Check auth state with loading

  const requiresAuth = (url: string) => {
    if (authRequiredUrls.includes(url)) {
      return true;
    }
    if (url.startsWith("/app/bookmark/collections/")) {
      return true;
    }
    return false;
  };

  const handleClick = (e: React.MouseEvent, url: string) => {
    if (loading) {
      e.preventDefault();
      return;
    }
    if (!user && requiresAuth(url)) {
      e.preventDefault();
      window.location.href = "/login";
    }
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{title}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const key = `${item.title}-${item.url}`;

          if ("customUI" in item && item.customUI && "url" in item) {
            return (
              <CustomBookmarkLink
                key={key}
                item={item as NavLink}
                href={pathname}
              />
            );
          }

          if (!("items" in item)) {
            const itemUrl =
              typeof item.url === "string" ? item.url : item.url.toString();
            return (
              <SidebarMenuLink
                key={key}
                item={item as NavLink}
                href={pathname}
                onClick={(e) => handleClick(e, itemUrl)}
              />
            );
          }

          if (state === "collapsed") {
            return (
              <SidebarMenuCollapsedDropdown
                key={key}
                item={item as NavCollapsible}
                href={pathname}
              />
            );
          }

          return (
            <SidebarMenuCollapsible
              key={key}
              item={item as NavCollapsible}
              href={pathname}
            />
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

// SidebarMenuLink Component
const SidebarMenuLink = ({
  item,
  href,
  onClick,
}: {
  item: NavLink;
  href: string;
  onClick: (e: React.MouseEvent) => void;
}) => {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={checkIsActive(href, item)}
        tooltip={item.title}
      >
        <Link
          href={item.url}
          onClick={(e) => {
            onClick(e);
            // setOpenMobile(false); // Uncomment if you want to close mobile sidebar on click
          }}
        >
          {item.icon && <item.icon />}
          <span>{item.title}</span>
          {item.badge && <NavBadge>{item.badge}</NavBadge>}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

// SidebarMenuCollapsible Component
const SidebarMenuCollapsible = ({
  item,
  href,
}: {
  item: NavCollapsible;
  href: string;
}) => {
  const { setOpenMobile } = useSidebar();
  const { user, loading } = useAuth(false);

  const requiresAuth = (url: string) => {
    if (authRequiredUrls.includes(url)) {
      return true;
    }
    if (url.startsWith("/app/bookmark/collections/")) {
      return true;
    }
    return false;
  };

  const handleSubLinkClick = (e: React.MouseEvent, subUrl: string) => {
    if (loading) {
      e.preventDefault();
      return;
    }
    if (!user && requiresAuth(subUrl)) {
      e.preventDefault();
      window.location.href = "/login";
    }
  };

  return (
    <Collapsible
      asChild
      defaultOpen={checkIsActive(href, item, true)}
      className="group/collapsible"
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip={item.title}>
            {item.icon && <item.icon />}
            <span>{item.title}</span>
            {item.badge && <NavBadge>{item.badge}</NavBadge>}
            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent className="CollapsibleContent">
          <SidebarMenuSub>
            {item.items.map((subItem) => {
              const subItemUrl =
                typeof subItem.url === "string"
                  ? subItem.url
                  : subItem.url.toString();
              return (
                <SidebarMenuSubItem key={subItem.title}>
                  <SidebarMenuSubButton
                    asChild
                    isActive={checkIsActive(href, subItem)}
                  >
                    <Link
                      href={subItem.url}
                      onClick={(e) => {
                        handleSubLinkClick(e, subItemUrl);
                        setOpenMobile(false);
                      }}
                    >
                      {subItem.icon && <subItem.icon />}
                      <span>{subItem.title}</span>
                      {subItem.badge && <NavBadge>{subItem.badge}</NavBadge>}
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              );
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
};

// SidebarMenuCollapsedDropdown Component
const SidebarMenuCollapsedDropdown = ({
  item,
  href,
}: {
  item: NavCollapsible;
  href: string;
}) => {
  const { user, loading } = useAuth(false);

  const requiresAuth = (url: string) => {
    if (authRequiredUrls.includes(url)) {
      return true;
    }
    if (url.startsWith("/app/bookmark/collections/")) {
      return true;
    }
    return false;
  };

  const handleSubLinkClick = (e: React.MouseEvent, subUrl: string) => {
    if (loading) {
      e.preventDefault();
      return;
    }
    if (!user && requiresAuth(subUrl)) {
      e.preventDefault();
      window.location.href = "/login";
    }
  };

  return (
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton
            tooltip={item.title}
            isActive={checkIsActive(href, item)}
          >
            {item.icon && <item.icon />}
            <span>{item.title}</span>
            {item.badge && <NavBadge>{item.badge}</NavBadge>}
            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="start" sideOffset={4}>
          <DropdownMenuLabel>
            {item.title} {item.badge ? `(${item.badge})` : ""}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {item.items.map((sub) => {
            const subUrl =
              typeof sub.url === "string" ? sub.url : sub.url.toString();
            return (
              <DropdownMenuItem key={`${sub.title}-${sub.url}`} asChild>
                <Link
                  href={sub.url}
                  className={`${checkIsActive(href, sub) ? "bg-secondary" : ""}`}
                  onClick={(e) => handleSubLinkClick(e, subUrl)}
                >
                  {sub.icon && <sub.icon />}
                  <span className="max-w-52 text-wrap">{sub.title}</span>
                  {sub.badge && (
                    <span className="ml-auto text-xs">{sub.badge}</span>
                  )}
                </Link>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
};

// Helper Components and Functions
const NavBadge = ({ children }: { children: ReactNode }) => (
  <Badge className="text-xs rounded-full px-1 py-0">{children}</Badge>
);

function checkIsActive(href: string, item: NavItem, mainNav = false) {
  return (
    href === item.url ||
    href.split("?")[0] === item.url ||
    !!item?.items?.filter((i) => i.url === href).length ||
    (mainNav &&
      href.split("/")[1] !== "" &&
      href.split("/")[1] ===
        (typeof item.url === "string" ? item.url.split("/")[1] : ""))
  );
}