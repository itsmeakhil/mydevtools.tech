import {
  IconChecklist,
  IconUnlink,
  IconBookmarks,
  IconCodeDots,
  IconAppWindow,
  IconArrowsExchange,
  IconTool,
  IconPhotoVideo,
  IconBlocks,
  IconNetwork,
  IconBook2,
  IconAlignJustified
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
          title: 'Url Shortener',
          url: '/app/url-shortener',
          icon: IconUnlink,
          description: 'Shorten long URLs for easy sharing.'
        },
        {
          title: 'Notes',
          url: '/app/notes',
          icon: IconBook2,
          description: 'Write, save, and organize your notes.'
        },
        {
          title: 'Bookmarks Manager',
          url: '#',
          badge: '3',
          icon: IconBookmarks,
          description: 'Organize and manage your favorite links.'
        },
        {
          title: 'Json Viewer',
          url: '#',
          icon: IconCodeDots,
          description: 'View and format JSON data.'
        },
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
              title: 'UUID Generator',
              url: '/app/uuid-generator',
              description: 'Generate unique identifiers for your projects.'
            },
            {
              title: 'ULID Generator',
              url: '/app/ulid-generator',
              description: 'Create time-based unique identifiers.'
            },
            {
              title: 'Encrypt / Decrypt Text',
              url: '/app/encrypt-decrypt-text',
              description: 'Encrypt or decrypt text for secure communication.'
            },
            {
              title: 'Token Generator',
              url: '/app/token-generator',
              description: 'Generate secure tokens for authentication.'
            },
            {
              title: 'Hash Generator',
              url: '/app/hash-generator',
              description: 'Generate hashes using popular algorithms.'
            },
            {
              title: 'Bcrypt',
              url: '/app/bcrypt',
              description: 'Encrypt passwords securely with Bcrypt.'
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
              description: 'Convert JSON data to XML format.'
            },
            {
              title: 'JSON to TOML',
              url: '/app/json-toml',
              description: 'Convert JSON data to TOML format.'
            },
            {
              title: 'JSON to YAML',
              url: '/app/json-yaml',
              description: 'Convert JSON data to YAML format.'
            },
            {
              title: 'JSON to CSV',
              url: '/app/json-csv',
              description: 'Convert JSON data to CSV format.'
            },
            {
              title: 'TOML to JSON',
              url: '/app/toml-json',
              description: 'Convert TOML data to JSON format.'
            },
            {
              title: 'TOML to YAML',
              url: '/app/toml-yaml',
              description: 'Convert TOML data to YAML format.'
            },
            {
              title: 'XML to JSON',
              url: '/app/xml-json',
              description: 'Convert XML data to JSON format.'
            },
            {
              title: 'YAML to JSON',
              url: '/app/yaml-json',
              description: 'Convert YAML data to JSON format.'
            },
            {
              title: 'YAML to TOML',
              url: '/app/yaml-toml',
              description: 'Convert YAML data to TOML format.'
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
              description: 'Encode or decode URLs for secure data handling.'
            },
            {
              title: 'Escape HTML Entities',
              url: '/app/html-entity-converter',
              description: 'Convert special characters to HTML entities.'
            },
            {
              title: 'URL Parser',
              url: '/app/url-parser',
              description: 'Extract details from URLs easily.'
            },
            {
              title: 'Device Information',
              url: '/app/device-info',
              description: 'Retrieve detailed information about your device.'
            },
            {
              title: 'OTP Generator',
              url: '/app/otp-generator',
              description: 'Generate one-time passwords for secure authentication.'
            },
            {
              title: 'JWT Parser',
              url: '/app/jwt-parser',
              description: 'Parse and decode JSON Web Tokens.'
            },
            {
              title: 'HTTP Status Codes',
              url: '/app/http-status-codes',
              description: 'Reference for HTTP status codes and their meanings.'
            },
            {
              title: 'JSON Diff',
              url: '/app/json-diff',
              description: 'Compare and find differences between JSON objects.'
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
              description: 'Generate QR codes for URLs, text, or data.'
            },
            {
              title: 'Wifi QR Code Generator',
              url: '/app/wifi-qr-generator',
              description: 'Create QR codes for sharing Wi-Fi credentials.'
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
              description: 'View essential Git commands for version control.'
            },
            {
              title: 'Crontab Generator',
              url: '/app/crontab-generator',
              description: 'Generate cron job schedules easily.'
            },
            {
              title: 'Chmod Calculator',
              url: '/app/chmod-calculator',
              description: 'Calculate and understand chmod permissions.'
            },
            {
              title: 'Regex Cheatsheet',
              url: '/app/regex-cheatsheet',
              description: 'Quick reference guide for regular expressions.'
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
              description: 'Calculate subnet details for IPv4 addresses.'
            },
            {
              title: 'IPv4 Address Converter',
              url: '/app/ipv4-address-converter',
              description: 'Convert IPv4 addresses between formats.'
            },
            {
              title: 'IPv4 Range Expander',
              url: '/app/ipv4-range-expander',
              description: 'Expand IPv4 address ranges for network configurations.'
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
              description: 'Generate placeholder text for design mockups.'
            },
            {
              title: 'Text Statistics',
              url: '/app/text-statistics',
              description: 'Analyze text word counts, length, and more.'
            },
            {
              title: 'Emoji Picker',
              url: '/app/emoji-picker',
              description: 'Pick and copy emojis for messages or designs.'
            },
            {
              title: 'String Obfuscator',
              url: '/app/string-obfuscator',
              description: 'Obfuscate strings to enhance security.'
            },
            {
              title: 'Numeronym Generator',
              url: '/app/numeronym-generator',
              description: 'Generate abbreviations with numbers.'
            },
          ],
        },
      ],
    },
  ],
}