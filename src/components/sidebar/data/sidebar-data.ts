import {
  IconChecklist,
  IconArrowsExchange,
  IconTool,
  IconNetwork,
  IconAlignJustified,
  IconShieldCode,
  IconHash,
  IconQrcode,
  IconPasswordMobilePhone,
  IconRouter,
  IconBlockquote,
  IconStrikethrough,
  IconNumber123,
  IconFileDescription,
  IconFileCode,
  IconFileTypeHtml,
  IconTimeDuration30,
  IconKey,
  IconJson,
  IconCode,
  IconClock,
  IconPalette,
  IconLock,
  IconNotes,
  IconDatabase,
  IconElevator,
} from '@tabler/icons-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'User',
    email: 'User@gmail.com',
    avatar: '/avatars/shadcn.jpg',
  },
  navGroups: [
    {
      title: 'Apps',
      items: [
        {
          title: 'Tasks',
          url: '/app/to-do',
          icon: IconChecklist,
          description: 'Manage your to-do lists efficiently.'
        },
        {
          title: 'Notes',
          url: '/app/notes',
          icon: IconNotes,
          description: 'Capture ideas and organize your thoughts.'
        },
        {
          title: 'Password Manager',
          url: '/app/password-manager',
          icon: IconLock,
          description: 'Securely store and manage your passwords.'
        },
        {
          title: 'JSON Editor',
          url: '/app/json-formatter',
          description: 'Advanced JSON editor and formatter.',
          icon: IconJson,
          hiddenOnMobile: true
        },

        {
          title: 'API Client',
          url: '/app/api-client',
          icon: IconNetwork,
          description: 'Test and debug HTTP requests.',
          hiddenOnMobile: true
        },
        {
          title: 'NoSQL Explorer',
          url: '/app/nosql-explorer',
          icon: IconDatabase,
          description: 'Explore MongoDB databases.',
          hiddenOnMobile: true
        },

      ],
    },
    {
      title: 'Generators',
      collapsible: true,
      hiddenOnMobile: true,
      icon: IconTool,
      items: [
        {
          title: 'UUID / ULID',
          url: '/app/uuid-generator',
          description: 'Generate and validate unique identifiers.',
          icon: IconElevator
        },
        {
          title: 'Token / Password',
          url: '/app/password-generator',
          description: 'Generate secure tokens and passwords.',
          icon: IconLock
        },
        {
          title: 'OTP',
          url: '/app/otp-generator',
          description: 'Generate one-time passwords.',
          icon: IconTimeDuration30
        },
        {
          title: 'QR Code',
          url: '/app/qr-code-generator',
          description: 'Generate QR codes for URLs, text, or data.',
          icon: IconQrcode
        },
        {
          title: 'WiFi QR',
          url: '/app/wifi-qr-generator',
          description: 'Create QR codes for sharing Wi-Fi credentials.',
          icon: IconQrcode
        },
        {
          title: 'Lorem Ipsum',
          url: '/app/lorem-ipsum-generator',
          description: 'Generate placeholder text.',
          icon: IconBlockquote
        },
        {
          title: 'Numeronym',
          url: '/app/numeronym-generator',
          description: 'Generate abbreviations with numbers.',
          icon: IconNumber123
        },
        {
          title: 'ASCII Art',
          url: '/app/ASCII-art-text-generator',
          description: 'Simple text-to-ASCII converter.',
          icon: IconFileDescription
        },
        {
          title: 'Crontab',
          url: '/app/crontab-generator',
          description: 'Generate cron job schedules easily.',
          icon: IconPasswordMobilePhone
        },
      ],
    },
    {
      title: 'Converters',
      collapsible: true,
      hiddenOnMobile: true,
      icon: IconArrowsExchange,
      items: [
        {
          title: 'JSON Converter',
          url: '/app/converters',
          description: 'Convert between JSON, XML, YAML, TOML, and CSV.',
          icon: IconJson
        },
        {
          title: 'JSON to Types',
          url: '/app/json-to-types',
          description: 'Generate types from JSON.',
          icon: IconCode
        },

        {
          title: 'Base64',
          url: '/app/base64-encoder',
          description: 'Encode and decode Base64.',
          icon: IconCode
        },
        {
          title: 'URL Encoder',
          url: '/app/url-encoder',
          description: 'Encode or decode URLs.',
          icon: IconFileCode
        },
        {
          title: 'HTML Entity',
          url: '/app/html-entity-converter',
          description: 'Convert special characters to HTML entities.',
          icon: IconFileTypeHtml
        },
        {
          title: 'Timestamp',
          url: '/app/timestamp-converter',
          description: 'Convert Unix timestamps.',
          icon: IconClock
        },
        {
          title: 'Color',
          url: '/app/color-converter',
          description: 'Convert between HEX, RGB, HSL, CMYK.',
          icon: IconPalette
        },
        {
          title: 'String Case',
          url: '/app/string-case-converter',
          description: 'Convert text case styles.',
          icon: IconAlignJustified
        },
        {
          title: 'IPv4 Address',
          url: '/app/ipv4-address-converter',
          description: 'Convert IPv4 addresses.',
          icon: IconRouter
        },
      ],
    },



  ],
}