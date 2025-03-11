import { Icon } from '@tabler/icons-react'

interface User {
  name: string
  email: string
  avatar: string
}

// interface BaseNavItem {
//   title: string
//   badge?: string
//   icon?: React.ElementType
// }

interface RightElement {
  icon: Icon
  onClick: (e: React.MouseEvent) => void
  className?: string
}

interface NavLink {
  title: string
  url?: string
  icon?: Icon
  badge?: string
  items?: NavLink[]
  id?: string
  rightElement?: RightElement
}

type LoadItemsFunction = (() => Promise<NavLink[]>) & {
  subscribe?: (callback: (items: NavLink[]) => void) => Promise<() => void>
}

interface NavCollapsible {
  title: string
  url?: string
  icon?: Icon
  badge?: string
  items: NavLink[]
  loadItems?: LoadItemsFunction
}

type NavItem = NavLink | NavCollapsible

interface NavGroup {
  title: string
  items: NavItem[]
}

interface SidebarData {
  user: User
  navGroups: NavGroup[]
}

export type { SidebarData, NavGroup, NavItem, NavCollapsible, NavLink, LoadItemsFunction }
