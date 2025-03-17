"use client";
import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Plus } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../ui/collapsible';
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
} from '@/components/ui/sidebar';
import { Badge } from '../ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { NavCollapsible, NavItem, NavLink, type NavGroup } from './types';

// CustomBookmarkLink Component
// CustomBookmarkLink Component in Nav-group.tsx
const CustomBookmarkLink = ({ item, href }: { item: NavLink; href: string }) => {
  // const { setOpenMobile } = useSidebar();
  const pathname = usePathname(); // Get the current pathname
  
  // Convert item.url to string if it's not already
  const itemUrl = typeof item.url === 'string' ? item.url : item.url.toString();
  
  // Check if we're currently on any bookmark page
  const isBookmarkPage = pathname.startsWith(itemUrl);
  
  // Check if we're on the dashboard specifically
  const isDashboardPage = pathname === `${itemUrl}/dashboard` || pathname === itemUrl;
  
  // Use isBookmarkPage to determine the initial state
  const [isOpen, setIsOpen] = useState(isBookmarkPage);

  // Ensure dropdown opens when navigating to a bookmark page
  useEffect(() => {
    if (isBookmarkPage) {
      setIsOpen(true);
    }
  }, [pathname, isBookmarkPage]);

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
            {/* Change the link to default to /dashboard */}
            <Link 
              href={`${item.url}/dashboard`} 
              onClick={() => setIsOpen(true)}
            >
              {item.icon && <item.icon />}
              <span>{item.title}</span>
              <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
            </Link>
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent className="CollapsibleContent">
          <SidebarMenuSub className="p-3">
            {/* Header */}
            <div className="text-lg font-medium mb-2">{item.title}</div>
            <hr className="mb-3" />

            {/* Main navigation items */}
            <div className="space-y-1">
              <SidebarMenuSubItem>
                <SidebarMenuSubButton 
                  asChild 
                  className={`py-2 px-3 hover:bg-accent rounded-md ${isDashboardPage ? 'bg-accent font-medium' : ''}`}
                >
                  <Link href={`${item.url}/dashboard`} className="flex items-center gap-2 w-full">
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

              {/* Other menu items remain the same */}
              <SidebarMenuSubItem>
                <SidebarMenuSubButton 
                  asChild 
                  className={`py-2 px-3 hover:bg-accent rounded-md ${pathname === `${item.url}/all` ? 'bg-accent font-medium' : ''}`}
                >
                  <Link href={`${item.url}/all`} className="flex items-center gap-2 w-full">
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
                  className={`py-2 px-3 hover:bg-accent rounded-md ${pathname === `${item.url}/collections` ? 'bg-accent font-medium' : ''}`}
                >
                  <Link href={`${item.url}/collections`} className="flex items-center gap-2 w-full">
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
                  className={`py-2 px-3 hover:bg-accent rounded-md ${pathname === `${item.url}/tags` ? 'bg-accent font-medium' : ''}`}
                >
                  <Link href={`${item.url}/tags`} className="flex items-center gap-2 w-full">
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

              <SidebarMenuSubItem>
                <SidebarMenuSubButton 
                  asChild 
                  className={`py-2 px-3 hover:bg-accent rounded-md ${pathname === `${item.url}/settings` ? 'bg-accent font-medium' : ''}`}
                >
                  <Link href={`${item.url}/settings`} className="flex items-center gap-2 w-full">
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
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l-.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                      </svg>
                    </div>
                    <span>Settings</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            </div>

            {/* Quick Access section */}
            <div className="mt-4 mb-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Quick Access</h3>
                <Link href={`${item.url}/add`} className="p-1 hover:bg-accent rounded-md">
                  <Plus className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Quick Access items */}
            <div className="space-y-1">
              <SidebarMenuSubItem>
                <SidebarMenuSubButton 
                  asChild 
                  className={`py-1 px-3 hover:bg-accent rounded-md ${pathname === `${item.url}/development` ? 'bg-accent font-medium' : ''}`}
                >
                  <Link href={`${item.url}/development`} className="w-full text-sm">
                    Development
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
              <SidebarMenuSubItem>
                <SidebarMenuSubButton 
                  asChild 
                  className={`py-1 px-3 hover:bg-accent rounded-md ${pathname === `${item.url}/design-resources` ? 'bg-accent font-medium' : ''}`}
                >
                  <Link href={`${item.url}/design-resources`} className="w-full text-sm">
                    Design Resources
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
              <SidebarMenuSubItem>
                <SidebarMenuSubButton 
                  asChild 
                  className={`py-1 px-3 hover:bg-accent rounded-md ${pathname === `${item.url}/reading-list` ? 'bg-accent font-medium' : ''}`}
                >
                  <Link href={`${item.url}/reading-list`} className="w-full text-sm">
                    Reading List
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            </div>
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
};
// Rest of the nav-group.tsx remains unchanged
export function NavGroup({ title, items }: NavGroup) {
  const { state } = useSidebar();
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{title}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const key = `${item.title}-${item.url}`;

          if (item.customUI && 'url' in item) {
            return <CustomBookmarkLink key={key} item={item as NavLink} href={pathname} />;
          }

          if (!item.items) {
            return <SidebarMenuLink key={key} item={item as NavLink} href={pathname} />;
          }

          if (state === 'collapsed') {
            return (
              <SidebarMenuCollapsedDropdown key={key} item={item as NavCollapsible} href={pathname} />
            );
          }

          return <SidebarMenuCollapsible key={key} item={item as NavCollapsible} href={pathname} />;
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

const NavBadge = ({ children }: { children: ReactNode }) => (
  <Badge className="text-xs rounded-full px-1 py-0">{children}</Badge>
);

const SidebarMenuLink = ({ item, href }: { item: NavLink; href: string }) => {
  const { setOpenMobile } = useSidebar();
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={checkIsActive(href, item)}
        tooltip={item.title}
      >
        <Link href={item.url} onClick={() => setOpenMobile(false)}>
          {item.icon && <item.icon />}
          <span>{item.title}</span>
          {item.badge && <NavBadge>{item.badge}</NavBadge>}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

const SidebarMenuCollapsible = ({
  item,
  href,
}: {
  item: NavCollapsible;
  href: string;
}) => {
  const { setOpenMobile } = useSidebar();
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
            {item.items.map((subItem) => (
              <SidebarMenuSubItem key={subItem.title}>
                <SidebarMenuSubButton
                  asChild
                  isActive={checkIsActive(href, subItem)}
                >
                  <Link href={subItem.url} onClick={() => setOpenMobile(false)}>
                    {subItem.icon && <subItem.icon />}
                    <span>{subItem.title}</span>
                    {subItem.badge && <NavBadge>{subItem.badge}</NavBadge>}
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
};

const SidebarMenuCollapsedDropdown = ({
  item,
  href,
}: {
  item: NavCollapsible;
  href: string;
}) => {
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
          {item.items.map((sub) => (
            <DropdownMenuItem key={`${sub.title}-${sub.url}`} asChild>
              <Link
                href={sub.url}
                className={`${checkIsActive(href, sub) ? "bg-secondary" : ""}`}
              >
                {sub.icon && <sub.icon />}
                <span className="max-w-52 text-wrap">{sub.title}</span>
                {sub.badge && (
                  <span className="ml-auto text-xs">{sub.badge}</span>
                )}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
};

function checkIsActive(href: string, item: NavItem, mainNav = false) {
  return (
    href === item.url ||
    href.split("?")[0] === item.url ||
    !!item?.items?.filter((i) => i.url === href).length ||
    (mainNav &&
      href.split("/")[1] !== "" &&
      href.split("/")[1] === (typeof item.url === "string" ? item.url.split("/")[1] : ""))
  );
}