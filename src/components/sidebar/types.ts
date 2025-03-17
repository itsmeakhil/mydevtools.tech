import { LinkProps } from 'next/link'

interface User {
  name: string
  email: string
  avatar: string
}

interface BaseNavItem {
  title: string
  badge?: string
  icon?: React.ElementType
  description?: string // ✅ Added description here
  customUI?: boolean;
}

type NavLink = BaseNavItem & {
  url: LinkProps['href']
  items?: never
}

type NavCollapsible = BaseNavItem & {
  items: (BaseNavItem & { url: LinkProps['href']; description?: string })[] // ✅ Added description in items
  url?: never
}

type NavItem = NavCollapsible | NavLink

interface NavGroup {
  title: string
  items: NavItem[]
}

interface SidebarData {
  user: User
  navGroups: NavGroup[]
}

export type { SidebarData, NavGroup, NavItem, NavCollapsible, NavLink }
