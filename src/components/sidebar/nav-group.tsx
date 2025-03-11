"use client"
import { ReactNode, useEffect, useState } from 'react'
import Link from 'next/link'
// import { useRouter } from 'next/router'
import { usePathname } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../ui/collapsible'
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
} from '@/components/ui/sidebar'
import { Badge } from '../ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { NavCollapsible, NavItem, NavLink, type NavGroup } from './types'

export function NavGroup({ title, items }: NavGroup) {
  const { state } = useSidebar()
  const pathname = usePathname()



  // const href = router.asPath
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{title}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const key = `${item.title}-${item.url || ''}`

          if (!item.items)
            return <SidebarMenuLink key={key} item={item} href={pathname} />

          if (state === 'collapsed')
            return (
              <SidebarMenuCollapsedDropdown key={key} item={item} href={pathname} />
            )

          return <SidebarMenuCollapsible key={key} item={item} href={pathname} />
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}

const NavBadge = ({ children }: { children: ReactNode }) => (
  <Badge className='text-xs rounded-full px-1 py-0'>{children}</Badge>
)

const SidebarMenuLink = ({ item, href }: { item: NavLink; href: string }) => {
  const { setOpenMobile } = useSidebar()
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={checkIsActive(href, item)}
        tooltip={item.title}
      >
        <Link href={item.url} onClick={() => setOpenMobile(false)} className="w-full">
          <div className="flex items-center w-full">
            {item.icon && <item.icon className="shrink-0 w-4 h-4 mr-2" />}
            <span className="flex-1 truncate">{item.title}</span>
            {item.badge && <NavBadge>{item.badge}</NavBadge>}
          </div>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

const NoteItem = ({ subItem, href, onClose }: { subItem: NavLink; href: string; onClose?: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <SidebarMenuSubItem key={subItem.title}>
      <SidebarMenuSubButton
        asChild
        isActive={checkIsActive(href, subItem)}
      >
        <Link 
          href={subItem.url} 
          onClick={onClose} 
          className="w-full"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="flex items-center w-full">
            {subItem.icon && <subItem.icon className="shrink-0 w-4 h-4 mr-2" />}
            <span className="flex-1 truncate">{subItem.title}</span>
            {subItem.badge && <NavBadge>{subItem.badge}</NavBadge>}
            {subItem.rightElement && (
              <>
                <div 
                  className={`${isHovered ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200 hover:text-destructive`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsOpen(true);
                  }}
                >
                  <subItem.rightElement.icon className="w-4 h-4 ml-2" />
                </div>
                <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your note.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          subItem.rightElement?.onClick(e);
                        }}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
        </Link>
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
  );
};

const SidebarMenuCollapsible = ({
  item,
  href,
}: {
  item: NavCollapsible
  href: string
}) => {
  const { setOpenMobile } = useSidebar()
  const [dynamicItems, setDynamicItems] = useState<NavLink[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const loadDynamicItems = async () => {
      if (item.loadItems) {
        setIsLoading(true);
        try {
          if (item.loadItems.subscribe) {
            // For real-time subscriptions
            unsubscribe = await item.loadItems.subscribe(setDynamicItems);
          } else {
            // For one-time loads
            const items = await item.loadItems();
            setDynamicItems(items);
          }
        } catch (error) {
          console.error('Error loading dynamic items:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadDynamicItems();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [item.loadItems]);

  const allItems = [...item.items, ...dynamicItems]

  return (
    <Collapsible
      asChild
      defaultOpen={checkIsActive(href, item, true)}
      className='group/collapsible'
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip={item.title}>
            <div className="flex items-center w-full">
              {item.icon && <item.icon className="shrink-0 w-4 h-4 mr-2" />}
              <span className="flex-1 truncate">{item.title}</span>
              {item.badge && <NavBadge>{item.badge}</NavBadge>}
              <ChevronRight className='ml-2 h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
            </div>
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent className='CollapsibleContent'>
          <SidebarMenuSub>
            {isLoading ? (
              <div className="px-2 py-1 text-sm text-muted-foreground">Loading...</div>
            ) : (
              allItems.map((subItem) => (
                <NoteItem 
                  key={subItem.title} 
                  subItem={subItem} 
                  href={href} 
                  onClose={() => setOpenMobile(false)}
                />
              ))
            )}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  )
}

const SidebarMenuCollapsedDropdown = ({
  item,
  href,
}: {
  item: NavCollapsible
  href: string
}) => {
  const [dynamicItems, setDynamicItems] = useState<NavLink[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const loadDynamicItems = async () => {
      if (item.loadItems) {
        setIsLoading(true);
        try {
          if (item.loadItems.subscribe) {
            unsubscribe = await item.loadItems.subscribe(setDynamicItems);
          } else {
            const items = await item.loadItems();
            setDynamicItems(items);
          }
        } catch (error) {
          console.error('Error loading dynamic items:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadDynamicItems();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [item.loadItems]);

  const allItems = [...item.items, ...dynamicItems]

  return (
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton
            tooltip={item.title}
            isActive={checkIsActive(href, item)}
          >
            <div className="flex items-center w-full">
              {item.icon && <item.icon className="shrink-0 w-4 h-4 mr-2" />}
              <span className="flex-1 truncate">{item.title}</span>
              {item.badge && <NavBadge>{item.badge}</NavBadge>}
              <ChevronRight className='ml-2 h-4 w-4 shrink-0 transition-transform duration-200' />
            </div>
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent side='right' align='start' sideOffset={4}>
          <DropdownMenuLabel>
            {item.title} {item.badge ? `(${item.badge})` : ''}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {isLoading ? (
            <div className="px-2 py-1 text-sm text-muted-foreground">Loading...</div>
          ) : (
            allItems.map((sub) => (
              <DropdownMenuItem key={`${sub.title}-${sub.url}`} asChild>
                <NoteItem subItem={sub} href={href} />
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  )
}

function checkIsActive(href: string, item: NavItem, mainNav = false) {
  if (!item.url) return false;
  
  return (
    href === item.url || // /endpint?search=param
    href.split('?')[0] === item.url || // endpoint
    !!item?.items?.filter((i) => i.url === href).length || // if child nav is active
    (mainNav &&
      href.split('/')[1] !== '' &&
      href.split('/')[1] === item.url.split('/')[1])
  )
}
