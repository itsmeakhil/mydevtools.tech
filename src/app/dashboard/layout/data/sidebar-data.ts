import {
  // IconBarrierBlock,
  // IconBrowserCheck,
  // IconBug,
  IconChecklist,
  // IconError404,
  // IconHelp,
  // IconLayoutDashboard,
  // IconLock,
  IconLockAccess,
  // IconMessages,
  // IconNotification,
  // IconPackages,
  // IconPalette,
  // IconServerOff,
  // IconSettings,
  // IconTool,
  // IconUserCog,
  // IconUserOff,
  // IconUsers,
  // IconJson,
  IconUnlink,
  IconBookmarks,
  IconCodeDots
} from '@tabler/icons-react'
import {Command, } from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'User',
    email: 'User@gmail.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'My Dev Tools',
      logo: Command,
      plan: 'toolkit for developers',
    },],

  navGroups: [
    {
      title: 'General Tools',
      items: [
        // {
        //   title: 'Dashboard',
        //   url: '/',
        //   icon: IconLayoutDashboard,
        // },
        {
          title: 'Tasks',
          url: '/dashboard/app/to-do',
          icon: IconChecklist,
        },
        {
          title: 'Url Shortener',
          url: '/dashboard/app/url-shortener',
          icon: IconUnlink,
        },
        {
          title: 'Bookmarks Manager',
          url: '#',
          badge: '3',
          icon: IconBookmarks,
        },
        {
          title: 'Json Viewer',
          url: '#',
          icon: IconCodeDots,
        },
      ],
    },
    {
      title: 'Specific Tools',
      items: [
        {
          title: 'Util Tools',
          icon: IconLockAccess,
          items: [
            {
              title: 'Uuid Generator',
              url: '/dashboard/app/uuid-generator',
            },
            {
              title: 'Encrypt/Decrypt Text',
              url: '/dashboard/app/encrypt-decrypt-text',
            },
            // {
            //   title: 'tool 3',
            //   url: '#',
            // },
            // {
            //   title: 'tool 4',
            //   url: '#',
            // },
            // {
            //   title: 'tool 5',
            //   url: '#',
            // },
          ],
        },
        // {
        //   title: 'Converters',
        //   icon: IconBug,
        //   items: [
        //     {
        //       title: 'converter 1',
        //       url: '#',
        //       icon: IconLock,
        //     },
        //     {
        //       title: 'converter 2',
        //       url: '#',
        //       icon: IconUserOff,
        //     },
        //     {
        //       title: 'converter 3',
        //       url: '#',
        //       icon: IconError404,
        //     },
        //     {
        //       title: 'converter 4',
        //       url: '#',
        //       icon: IconServerOff,
        //     },
        //     {
        //       title: 'converter 5',
        //       url: '#',
        //       icon: IconBarrierBlock,
        //     },
        //   ],
        // },
      ],
    },
    // {
    //   title: 'Other',
    //   items: [
    //     {
    //       title: 'Settings',
    //       icon: IconSettings,
    //       items: [
    //         {
    //           title: 'Profile',
    //           url: '#',
    //           icon: IconUserCog,
    //         },
    //         {
    //           title: 'Account',
    //           url: '#',
    //           icon: IconTool,
    //         },
    //         {
    //           title: 'Appearance',
    //           url: '#',
    //           icon: IconPalette,
    //         },
    //         {
    //           title: 'Notifications',
    //           url: '#',
    //           icon: IconNotification,
    //         },
    //         {
    //           title: 'Display',
    //           url: '#',
    //           icon: IconBrowserCheck,
    //         },
    //       ],
    //     },
    //     {
    //       title: 'Help Center',
    //       url: '#',
    //       icon: IconHelp,
    //     },
    //   ],
    // },
  ],
}
