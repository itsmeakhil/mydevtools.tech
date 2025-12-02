import {
  IconChecklist,
  IconUnlink,
  IconAppWindow,
  IconArrowsExchange,
  IconTool,
  IconPhotoVideo,
  IconBlocks,
  IconNetwork,
  // IconBook2,
  IconAlignJustified,
  IconShieldCode,
  IconHash,
  IconQrcode,
  IconGitFork,
  IconPasswordMobilePhone,
  IconCodeAsterisk,
  IconRegex,
  IconRouter,
  IconBlockquote,
  IconAlignBoxBottomCenter,
  IconMoodSmile,
  IconStrikethrough,
  IconNumber123,
  IconFileDescription,
  IconLayersDifference,
  IconFileCode,
  IconFileTypeHtml,
  IconForms,
  IconDevices,
  IconTimeDuration30,
  IconKey,
  IconBraces,
  IconWorldWww,
  IconPasswordFingerprint,
  IconElevator,
  IconElevatorFilled,
  IconFileTypeXml,
  IconFileTypeCsv,
  IconJson,
  IconToml,
  IconSquareRoundedLetterY,
  IconCode,
  IconClock,
  IconPalette,
  IconLock,
  IconNotes,
  IconDatabase,
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
    {
      title: 'Developer',
      collapsible: true,
      hiddenOnMobile: true,
      icon: IconCode,
      items: [
        {
          title: 'Git Commands',
          url: '/app/git-commands',
          description: 'Git command reference.',
          icon: IconGitFork
        },
        {
          title: 'Chmod Calc',
          url: '/app/chmod-calculator',
          description: 'Calculate chmod permissions.',
          icon: IconCodeAsterisk
        },
        {
          title: 'Regex',
          url: '/app/regex-cheatsheet',
          description: 'Regular expression cheatsheet.',
          icon: IconRegex
        },
        {
          title: 'HTTP Status',
          url: '/app/http-status-codes',
          description: 'HTTP status code reference.',
          icon: IconWorldWww
        },
        {
          title: 'Device Info',
          url: '/app/device-info',
          description: 'View your device information.',
          icon: IconDevices
        },
        {
          title: 'Markdown',
          url: '/app/markdown-preview',
          description: 'Markdown editor and preview.',
          icon: IconFileDescription
        },
      ],
    },
    {
      title: 'Security',
      collapsible: true,
      hiddenOnMobile: true,
      icon: IconShieldCode,
      items: [
        {
          title: 'Encryption',
          url: '/app/encryption',
          description: 'Encrypt text and generate hashes.',
          icon: IconShieldCode
        },
        {
          title: 'Hash Gen',
          url: '/app/hash-generator',
          description: 'Generate hashes.',
          icon: IconHash
        },
        {
          title: 'JWT Parser',
          url: '/app/jwt-parser',
          description: 'Parse JSON Web Tokens.',
          icon: IconKey
        },
        {
          title: 'Obfuscator',
          url: '/app/string-obfuscator',
          description: 'Obfuscate strings.',
          icon: IconStrikethrough
        },
      ],
    },
    {
      title: 'Text & Diff',
      collapsible: true,
      hiddenOnMobile: true,
      icon: IconFileDescription,
      items: [
        {
          title: 'Text Stats',
          url: '/app/text-statistics',
          description: 'Word count and text analysis.',
          icon: IconAlignBoxBottomCenter
        },
        {
          title: 'Emoji Picker',
          url: '/app/emoji-picker',
          description: 'Pick and copy emojis.',
          icon: IconMoodSmile
        },
        {
          title: 'Text Diff',
          url: '/app/text-diff',
          description: 'Compare text differences.',
          icon: IconLayersDifference
        },
        {
          title: 'JSON Diff',
          url: '/app/json-diff',
          description: 'Compare JSON objects.',
          icon: IconBraces
        },
      ],
    },
    {
      title: 'Network',
      collapsible: true,
      hiddenOnMobile: true,
      icon: IconNetwork,
      items: [
        {
          title: 'Subnet Calc',
          url: '/app/ipv4-subnet-calculator',
          description: 'IPv4 subnet calculator.',
          icon: IconRouter
        },
        {
          title: 'Range Expander',
          url: '/app/ipv4-range-expander',
          description: 'Expand IPv4 ranges.',
          icon: IconRouter
        },
        {
          title: 'URL Parser',
          url: '/app/url-parser',
          description: 'Parse URL components.',
          icon: IconForms
        },
      ],
    },
  ],
}