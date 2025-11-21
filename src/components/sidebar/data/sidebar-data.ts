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
  // IconNotes,
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
        //  {
        //   title: 'Notes',
        //   url: '/app/notes',
        //   icon: IconBook2,
        //   description: 'Write, save, and organize your notes.'
        // },
        {
          title: 'Tasks',
          url: '/app/to-do',
          icon: IconChecklist,
          description: 'Manage your to-do lists efficiently.'
        },
        {
          title: 'Url Shortener',
          url: '/app/url-shortener',
          icon: IconUnlink,
          description: 'Shorten long URLs for easy sharing.'
        },
        {
          title: 'Markdown Preview',
          url: '/app/markdown-preview',
          icon: IconFileDescription,
          description: 'Write and preview markdown in real-time with GitHub Flavored Markdown support.'
        }
      ],
    },
    {
      title: 'Specific Tools',
      items: [
        {
          title: 'Util Tools',
          icon: IconTool,
          items: [
            {
              title: 'UUID / ULID Generator',
              url: '/app/uuid-generator',
              description: 'Generate and validate unique identifiers (UUID/ULID).',
              icon: IconElevator
            },

            {
              title: 'Encrypt / Decrypt Text',
              url: '/app/encrypt-decrypt-text',
              description: 'Encrypt or decrypt text for secure communication.',
              icon: IconShieldCode
            },

            {
              title: 'Hash Generator',
              url: '/app/hash-generator',
              description: 'Generate hashes using popular algorithms.',
              icon: IconHash
            },
            {
              title: 'Bcrypt',
              url: '/app/bcrypt',
              description: 'Encrypt passwords securely with Bcrypt.',
              icon: IconShieldCode

            },
            {
              title: 'Token / Password Generator',
              url: '/app/password-generator',
              description: 'Generate secure tokens and passwords with custom options.',
              icon: IconLock
            },
          ],
        },
        {
          title: 'Converters',
          icon: IconArrowsExchange,
          items: [
            {
              title: 'JSON to XML',
              url: '/app/json-xml',
              description: 'Convert JSON data to XML format.',
              icon: IconFileTypeXml
            },
            {
              title: 'JSON to TOML',
              url: '/app/json-toml',
              description: 'Convert JSON data to TOML format.',
              icon: IconToml
            },
            {
              title: 'JSON to YAML',
              url: '/app/json-yaml',
              description: 'Convert JSON data to YAML format.',
              icon: IconSquareRoundedLetterY
            },
            {
              title: 'JSON to CSV',
              url: '/app/json-csv',
              description: 'Convert JSON data to CSV format.',
              icon: IconFileTypeCsv
            },
            {
              title: 'TOML to JSON',
              url: '/app/toml-json',
              description: 'Convert TOML data to JSON format.',
              icon: IconJson
            },
            {
              title: 'TOML to YAML',
              url: '/app/toml-yaml',
              description: 'Convert TOML data to YAML format.',
              icon: IconSquareRoundedLetterY

            },
            {
              title: 'XML to JSON',
              url: '/app/xml-json',
              description: 'Convert XML data to JSON format.',
              icon: IconJson
            },
            {
              title: 'YAML to JSON',
              url: '/app/yaml-json',
              description: 'Convert YAML data to JSON format.',
              icon: IconJson
            },
            {
              title: 'YAML to TOML',
              url: '/app/yaml-toml',
              description: 'Convert YAML data to TOML format.',
              icon: IconToml
            },
          ],
        },
        {
          title: 'Web',
          icon: IconAppWindow,
          items: [
            {
              title: 'Encode/Decode URL',
              url: '/app/url-encoder',
              description: 'Encode or decode URLs for secure data handling.',
              icon: IconFileCode
            },
            {
              title: 'Escape HTML Entities',
              url: '/app/html-entity-converter',
              description: 'Convert special characters to HTML entities.',
              icon: IconFileTypeHtml
            },
            {
              title: 'URL Parser',
              url: '/app/url-parser',
              description: 'Extract details from URLs easily.',
              icon: IconForms
            },
            {
              title: 'Device Information',
              url: '/app/device-info',
              description: 'Retrieve detailed information about your device.',
              icon: IconDevices
            },
            {
              title: 'OTP Generator',
              url: '/app/otp-generator',
              description: 'Generate one-time passwords for secure authentication.',
              icon: IconTimeDuration30
            },
            {
              title: 'JWT Parser',
              url: '/app/jwt-parser',
              description: 'Parse and decode JSON Web Tokens.',
              icon: IconKey
            },
            {
              title: 'HTTP Status Codes',
              url: '/app/http-status-codes',
              description: 'Reference for HTTP status codes and their meanings.',
              icon: IconWorldWww
            },
            {
              title: 'JSON Diff',
              url: '/app/json-diff',
              description: 'Compare and find differences between JSON objects.',
              icon: IconBraces
            },
            {
              title: 'Base64 Encoder/Decoder',
              url: '/app/base64-encoder',
              description: 'Encode and decode text to/from Base64 format.',
              icon: IconCode
            },
            {
              title: 'JSON Formatter',
              url: '/app/json-formatter',
              description: 'Beautify, validate, and minify JSON data.',
              icon: IconJson
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
          ],
        },
        {
          title: 'Images and Videos',
          icon: IconPhotoVideo,
          items: [
            {
              title: 'QR Code Generator',
              url: '/app/qr-code-generator',
              description: 'Generate QR codes for URLs, text, or data.',
              icon: IconQrcode
            },
            {
              title: 'Wifi QR Code Generator',
              url: '/app/wifi-qr-generator',
              description: 'Create QR codes for sharing Wi-Fi credentials.',
              icon: IconQrcode
            },
          ],
        },
        {
          title: 'Development',
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
          ],
        },
        {
          title: 'Network',
          icon: IconNetwork,
          items: [
            {
              title: 'IPv4 Subnet Calculator',
              url: '/app/ipv4-subnet-calculator',
              description: 'Calculate subnet details for IPv4 addresses.',
              icon: IconRouter
            },
            {
              title: 'IPv4 Address Converter',
              url: '/app/ipv4-address-converter',
              description: 'Convert IPv4 addresses between formats.',
              icon: IconRouter

            },
            {
              title: 'IPv4 Range Expander',
              url: '/app/ipv4-range-expander',
              description: 'Expand IPv4 address ranges for network configurations.',
              icon: IconRouter
            },
          ],
        },
        {
          title: 'Text',
          icon: IconAlignJustified,
          items: [
            {
              title: 'Lorem Ipsum Generator',
              url: '/app/lorem-ipsum-generator',
              description: 'Generate placeholder text for design mockups.',
              icon: IconBlockquote
            },
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
            {
              title: 'String Obfuscator',
              url: '/app/string-obfuscator',
              description: 'Obfuscate strings to enhance security.',
              icon: IconStrikethrough
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
            {
              title: 'Text diff',
              url: '/app/text-diff',
              description: 'Compare two texts and see the differences between them.',
              icon: IconLayersDifference
            },
            {
              title: 'String Case Converter',
              url: '/app/string-case-converter',
              description: 'Convert text between camelCase, kebab-case, snake_case, and more.',
              icon: IconAlignJustified
            },
          ],
        },
      ],
    },
  ],
}