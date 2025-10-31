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
import { NavCollapsible, NavItem, NavLink } from "./types"; // Import types
import useAuth from "@/utils/useAuth"; // Import useAuth
import { requiresAuth } from "@/lib/tool-config";

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

  // Use centralized requiresAuth function from tool-config

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
  const { setOpenMobile } = useSidebar();
  const isNotesItem = item.url === '/app/notes';
  
  const handleCreateNewNote = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Use window.location to avoid React rendering conflicts
    // This will do a full page navigation but avoids the flushSync error
    // Add skipLoading=true parameter to tell the notes page to skip all loading states
    window.location.href = '/app/notes?new=true&skipLoading=true';
    
    // Close the mobile sidebar
    setOpenMobile(false);
  };
  
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
          className="relative flex items-center"
        >
          {item.icon && <item.icon />}
          <span>{item.title}</span>
          {item.badge && <NavBadge>{item.badge}</NavBadge>}
          {isNotesItem && (
            <div 
              className="ml-auto flex items-center" 
              onClick={e => e.stopPropagation()}
            >
              <Plus 
                className="h-4 w-4 cursor-pointer hover:text-primary opacity-70 hover:opacity-100" 
                onClick={handleCreateNewNote}
                aria-label="Create new note"
              />
            </div>
          )}
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

  // Use centralized requiresAuth function from tool-config

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

  // Use centralized requiresAuth function from tool-config

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