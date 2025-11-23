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
      title: 'General Tools',
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
          title: 'URL Shortener',
          url: '/app/url-shortener',
          icon: IconUnlink,
          description: 'Shorten long URLs for easy sharing.'
        },
        {
          title: 'Markdown Preview',
          url: '/app/markdown-preview',
          icon: IconFileDescription,
          description: 'Write and preview markdown in real-time with GitHub Flavored Markdown support.'
        },
        {
          title: 'Device Information',
          url: '/app/device-info',
          description: 'Retrieve detailed information about your device.',
          icon: IconDevices
        },
      ],
    },
    {
      title: 'Specific Tools',
      items: [
        {
          title: 'Generators',
          icon: IconTool,
          items: [
            {
              title: 'UUID / ULID Generator',
              url: '/app/uuid-generator',
              description: 'Generate and validate unique identifiers (UUID/ULID).',
              icon: IconElevator
            },
            {
              title: 'Token / Password Generator',
              url: '/app/password-generator',
              description: 'Generate secure tokens and passwords with custom options.',
              icon: IconLock
            },
            {
              title: 'OTP Generator',
              url: '/app/otp-generator',
              description: 'Generate one-time passwords for secure authentication.',
              icon: IconTimeDuration30
            },
            {
              title: 'QR Code Generator',
              url: '/app/qr-code-generator',
              description: 'Generate QR codes for URLs, text, or data.',
              icon: IconQrcode
            },
            {
              title: 'WiFi QR Code Generator',
              url: '/app/wifi-qr-generator',
              description: 'Create QR codes for sharing Wi-Fi credentials.',
              icon: IconQrcode
            },
            {
              title: 'Lorem Ipsum Generator',
              url: '/app/lorem-ipsum-generator',
              description: 'Generate placeholder text for design mockups.',
              icon: IconBlockquote
            },
            {
              title: 'Numeronym Generator',
              url: '/app/numeronym-generator',
              description: 'Generate abbreviations with numbers.',
              icon: IconNumber123
            },
            {
              title: 'ASCII Art Text Generator',
              url: '/app/ASCII-art-text-generator',
              description: 'Simple text-to-ASCII converter.',
              icon: IconFileDescription
            },
          ],
        },
        {
          title: 'Security & Encryption',
          icon: IconShieldCode,
          items: [
            {
              title: 'Encryption & Hashing',
              url: '/app/encryption',
              description: 'Encrypt text and generate hashes securely.',
              icon: IconShieldCode
            },
            {
              title: 'Hash Generator',
              url: '/app/hash-generator',
              description: 'Generate hashes using popular algorithms.',
              icon: IconHash
            },
            {
              title: 'JWT Parser',
              url: '/app/jwt-parser',
              description: 'Parse and decode JSON Web Tokens.',
              icon: IconKey
            },
            {
              title: 'String Obfuscator',
              url: '/app/string-obfuscator',
              description: 'Obfuscate strings to enhance security.',
              icon: IconStrikethrough
            },
          ],
        },
        {
          title: 'Converters & Formatters',
          icon: IconArrowsExchange,
          items: [
            {
              title: 'JSON Converter',
              url: '/app/converters',
              description: 'Convert between JSON, XML, YAML, TOML, and CSV.',
              icon: IconJson
            },
            {
              title: 'JSON Editor',
              url: '/app/json-formatter',
              description: 'Advanced JSON editor with Text, Tree, and Table modes. Format, validate, compare, and transform JSON.',
              icon: IconJson
            },
            {
              title: 'Base64 Encoder/Decoder',
              url: '/app/base64-encoder',
              description: 'Encode and decode text to/from Base64 format.',
              icon: IconCode
            },
            {
              title: 'URL Encoder/Decoder',
              url: '/app/url-encoder',
              description: 'Encode or decode URLs for secure data handling.',
              icon: IconFileCode
            },
            {
              title: 'HTML Entity Converter',
              url: '/app/html-entity-converter',
              description: 'Convert special characters to HTML entities.',
              icon: IconFileTypeHtml
            },
            {
              title: 'Timestamp Converter',
              url: '/app/timestamp-converter',
              description: 'Convert between Unix timestamps and readable dates.',
              icon: IconClock
            },
            {
              title: 'Color Converter',
              url: '/app/color-converter',
              description: 'Convert colors between HEX, RGB, HSL, and CMYK.',
              icon: IconPalette
            },
            {
              title: 'String Case Converter',
              url: '/app/string-case-converter',
              description: 'Convert text between camelCase, kebab-case, snake_case, and more.',
              icon: IconAlignJustified
            },
            {
              title: 'IPv4 Address Converter',
              url: '/app/ipv4-address-converter',
              description: 'Convert IPv4 addresses between formats.',
              icon: IconRouter
            },
          ],
        },
        {
          title: 'Comparison Tools',
          icon: IconLayersDifference,
          items: [
            {
              title: 'JSON Diff',
              url: '/app/json-diff',
              description: 'Compare and find differences between JSON objects.',
              icon: IconBraces
            },
            {
              title: 'Text Diff',
              url: '/app/text-diff',
              description: 'Compare two texts and see the differences between them.',
              icon: IconLayersDifference
            },
          ],
        },
        {
          title: 'Developer Tools',
          icon: IconBlocks,
          items: [
            {
              title: 'Git Commands',
              url: '/app/git-commands',
              description: 'View essential Git commands for version control.',
              icon: IconGitFork
            },
            {
              title: 'Crontab Generator',
              url: '/app/crontab-generator',
              description: 'Generate cron job schedules easily.',
              icon: IconPasswordMobilePhone
            },
            {
              title: 'Chmod Calculator',
              url: '/app/chmod-calculator',
              description: 'Calculate and understand chmod permissions.',
              icon: IconCodeAsterisk
            },
            {
              title: 'Regex Cheatsheet',
              url: '/app/regex-cheatsheet',
              description: 'Quick reference guide for regular expressions.',
              icon: IconRegex
            },
            {
              title: 'HTTP Status Codes',
              url: '/app/http-status-codes',
              description: 'Reference for HTTP status codes and their meanings.',
              icon: IconWorldWww
            },
          ],
        },
        {
          title: 'Network Tools',
          icon: IconNetwork,
          items: [
            {
              title: 'IPv4 Subnet Calculator',
              url: '/app/ipv4-subnet-calculator',
              description: 'Calculate subnet details for IPv4 addresses.',
              icon: IconRouter
            },
            {
              title: 'IPv4 Range Expander',
              url: '/app/ipv4-range-expander',
              description: 'Expand IPv4 address ranges for network configurations.',
              icon: IconRouter
            },
            {
              title: 'URL Parser',
              url: '/app/url-parser',
              description: 'Extract details from URLs easily.',
              icon: IconForms
            },
          ],
        },
        {
          title: 'Text Tools',
          icon: IconAlignJustified,
          items: [
            {
              title: 'Text Statistics',
              url: '/app/text-statistics',
              description: 'Analyze text word counts, length, and more.',
              icon: IconAlignBoxBottomCenter
            },
            {
              title: 'Emoji Picker',
              url: '/app/emoji-picker',
              description: 'Pick and copy emojis for messages or designs.',
              icon: IconMoodSmile
            },
          ],
        },
      ],
    },
  ],
}