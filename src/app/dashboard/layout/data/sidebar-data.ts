import {
  IconChecklist,
  IconLockAccess,
  IconUnlink,
  IconBookmarks,
  IconCodeDots,
  IconAppWindow
} from '@tabler/icons-react'
import { type SidebarData } from '../types'

// import {app-window } from 'lucide-react'


export const sidebarData: SidebarData = {
  user: {
    name: 'User',
    email: 'User@gmail.com',
    avatar: '/avatars/shadcn.jpg',
  },
  navGroups: [
    {
      title: 'General Tools',
      items: [
        {
          title: 'Tasks',
          url: '/app/to-do',
          icon: IconChecklist,
        },
        {
          title: 'Url Shortener',
          url: '/app/url-shortener',
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
              title: 'UUID Generator',
              url: '/app/uuid-generator',
            },
            {
              title: 'ULID Generator',
              url: '/app/ulid-generator',
            },
            {
              title: 'Encrypt / Decrypt Text',
              url: '/app/encrypt-decrypt-text',
            },
            {
              title: 'Token Generator',
              url: '/app/token-generator',
            },

            {
              title: 'Hash Generator',
              url: '/app/hash-generator',
            },
            {
              title: 'Bcrypt',
              url: '/app/bcrypt',
            },
            
          ],
        },
        {
          title: 'Converters',
          icon: IconLockAccess,
          items: [
            {
              title: 'JSON to XML',
              url: '/app/json-xml',
            },
            {
              title: 'JSON to TOML',
              url: '/app/json-toml',
            },
            {
              title: 'JSON to YAML',
              url: '/app/json-yaml',
            },
            {
              title: 'TOML to JSON',
              url: '/app/toml-json',
            },

            // {
            //   title: 'TOML to JSON',
            //   url: '/app/toml-json',
            // },
            {
              title: 'TOML to YAML',
              url: '/app/toml-yaml',
            },
            {
              title: 'XML to JSON',
              url: '/app/xml-json',
            },

            {
              title: 'YAML to JSON',
              url: '/app/yaml-json',
            },
            {
              title: 'YAML to TOML',
              url: '/app/yaml-toml',
            },
            
            
          ],
        },
        {
          title: 'Web ',
          icon: IconAppWindow,
          items: [
            {
              title: 'Encode/Decode URL',
              url: '/app/url-encoder',
            },
            {
              title: 'Escape HTML Entities',
              url: '/app/html-entity-converter',
            },
            {
              title: 'URL Parser',
              url: '/app/url-parser',
            },
            {
              title: 'Device Information',
              url: '/app/device-info',
            },

            
            
            
          ],
        }
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
