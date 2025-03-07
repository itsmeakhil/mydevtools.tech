"use client"
import { ReactNode, useEffect, useState } from 'react'
import Link from 'next/link'
// import { useRouter } from 'next/router'
import { usePathname } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
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
        <Link href={item.url} onClick={() => setOpenMobile(false)}>
          {item.icon && <item.icon />}
          <span>{item.title}</span>
          {item.badge && <NavBadge>{item.badge}</NavBadge>}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

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
            {item.icon && <item.icon />}
            <span>{item.title}</span>
            {item.badge && <NavBadge>{item.badge}</NavBadge>}
            <ChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent className='CollapsibleContent'>
          <SidebarMenuSub>
            {isLoading ? (
              <div className="px-2 py-1 text-sm text-muted-foreground">Loading...</div>
            ) : (
              allItems.map((subItem) => (
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
            <ChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
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
                <Link
                  href={sub.url}
                  className={`${checkIsActive(href, sub) ? 'bg-secondary' : ''}`}
                >
                  {sub.icon && <sub.icon />}
                  <span className='max-w-52 text-wrap'>{sub.title}</span>
                  {sub.badge && (
                    <span className='ml-auto text-xs'>{sub.badge}</span>
                  )}
                </Link>
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
