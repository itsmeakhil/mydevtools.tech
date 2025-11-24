import { Metadata } from 'next'

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mydevtools.tech'

// Tool metadata definitions
export const toolsMetadata: Record<string, {
    title: string
    description: string
    keywords: string[]
}> = {
    'password-generator': {
        title: 'Password Generator - Generate Secure Passwords',
        description: 'Generate strong, secure passwords and tokens with customizable length (4-512 characters). Include uppercase, lowercase, numbers, and symbols. Free online password generator tool.',
        keywords: ['password generator', 'secure password', 'random password', 'password maker', 'strong password', 'token generator']
    },
    'uuid-generator': {
        title: 'UUID Generator - Generate Unique Identifiers',
        description: 'Generate UUIDs (v1, v4, v5) instantly. Create unique identifiers for databases, APIs, and applications. Free UUID generator tool online.',
        keywords: ['uuid generator', 'guid generator', 'unique identifier', 'uuid v4', 'random uuid']
    },
    'hash-generator': {
        title: 'Hash Generator - MD5, SHA-256, SHA-512',
        description: 'Generate cryptographic hashes online. Supports MD5, SHA-1, SHA-256, SHA-512, and more. Free hash generator for developers.',
        keywords: ['hash generator', 'md5', 'sha256', 'sha512', 'checksum', 'cryptographic hash']
    },
    'base64-encoder': {
        title: 'Base64 Encoder/Decoder - Encode and Decode Text',
        description: 'Encode and decode Base64 strings online. Convert text, images, or files to Base64 format. Free Base64 encoder/decoder tool.',
        keywords: ['base64 encoder', 'base64 decoder', 'base64 converter', 'encode base64', 'decode base64']
    },
    'json-formatter': {
        title: 'JSON Formatter - Validate, Format, and Minify JSON',
        description: 'Format, validate, and minify JSON data online. Free JSON formatter with syntax highlighting and error detection.',
        keywords: ['json formatter', 'json validator', 'json minifier', 'json beautifier', 'format json']
    },
    'url-encoder': {
        title: 'URL Encoder/Decoder - Encode and Decode URLs',
        description: 'Encode and decode URLs online. Convert special characters for safe URL transmission. Free URL encoder/decoder tool.',
        keywords: ['url encoder', 'url decoder', 'percent encoding', 'url escape', 'encode url']
    },
    'qr-code-generator': {
        title: 'QR Code Generator - Create QR Codes Online',
        description: 'Generate QR codes for URLs, text, WiFi, and more. Free online QR code generator with customization options.',
        keywords: ['qr code generator', 'qr code maker', 'create qr code', 'qr generator', 'barcode generator']
    },
    'color-converter': {
        title: 'Color Converter - HEX, RGB, HSL Converter',
        description: 'Convert colors between HEX, RGB, HSL, and other formats. Free color converter tool for designers and developers.',
        keywords: ['color converter', 'hex to rgb', 'rgb to hex', 'color picker', 'color code converter']
    },
    'timestamp-converter': {
        title: 'Timestamp Converter - Unix Time Converter',
        description: 'Convert Unix timestamps to human-readable dates. Free timestamp converter with timezone support.',
        keywords: ['timestamp converter', 'unix timestamp', 'epoch time', 'date converter', 'time converter']
    },
    'jwt-parser': {
        title: 'JWT Parser - Decode and Verify JWT Tokens',
        description: 'Parse, decode, and verify JWT tokens online. Debug JSON Web Tokens with our free JWT parser tool.',
        keywords: ['jwt parser', 'jwt decoder', 'json web token', 'jwt validator', 'decode jwt']
    },
    'markdown-preview': {
        title: 'Markdown Preview - Live Markdown Editor',
        description: 'Edit and preview Markdown in real-time. Free online Markdown editor with live preview and syntax highlighting.',
        keywords: ['markdown editor', 'markdown preview', 'md editor', 'markdown viewer', 'live markdown']
    },
    'regex-cheatsheet': {
        title: 'Regex Cheatsheet - Regular Expression Reference',
        description: 'Comprehensive regular expression cheatsheet with examples. Quick reference for regex patterns and syntax.',
        keywords: ['regex cheatsheet', 'regular expression', 'regex reference', 'regex guide', 'regex patterns']
    },
    'text-diff': {
        title: 'Text Diff - Compare Text Online',
        description: 'Compare and find differences between two texts. Free text diff tool with side-by-side comparison.',
        keywords: ['text diff', 'compare text', 'text comparison', 'diff checker', 'text difference']
    },
    'json-diff': {
        title: 'JSON Diff - Compare JSON Objects',
        description: 'Compare JSON objects and find differences. Free JSON diff tool with visual comparison.',
        keywords: ['json diff', 'compare json', 'json comparison', 'json difference', 'diff json']
    },
    'lorem-ipsum-generator': {
        title: 'Lorem Ipsum Generator - Placeholder Text Generator',
        description: 'Generate Lorem Ipsum placeholder text. Free Lorem Ipsum generator for designers and developers.',
        keywords: ['lorem ipsum', 'placeholder text', 'dummy text', 'lorem generator', 'filler text']
    },
    'string-case-converter': {
        title: 'String Case Converter - Change Text Case',
        description: 'Convert text between different cases: uppercase, lowercase, title case, camelCase, snake_case, and more.',
        keywords: ['case converter', 'text case', 'uppercase', 'lowercase', 'camelcase', 'snake case']
    },
    'html-entity-converter': {
        title: 'HTML Entity Converter - Encode and Decode HTML',
        description: 'Convert HTML entities to characters and vice versa. Free HTML entity encoder/decoder tool.',
        keywords: ['html entity', 'html encoder', 'html decoder', 'html escape', 'html characters']
    },
    'crontab-generator': {
        title: 'Crontab Generator - Cron Schedule Expression',
        description: 'Generate cron expressions with visual editor. Free crontab generator for scheduling tasks.',
        keywords: ['crontab generator', 'cron expression', 'cron schedule', 'cron generator', 'crontab syntax']
    },
    'encryption': {
        title: 'Text Encryption - Encrypt and Decrypt Text',
        description: 'Encrypt and decrypt text using AES encryption. Secure text encryption tool for developers.',
        keywords: ['text encryption', 'aes encryption', 'encrypt text', 'decrypt text', 'data encryption']
    },
    'otp-generator': {
        title: 'OTP Generator - One-Time Password Generator',
        description: 'Generate One-Time Passwords (OTP) for testing authentication. Free OTP generator tool.',
        keywords: ['otp generator', 'one time password', 'totp', 'hotp', 'authenticator']
    },
    'password-manager': {
        title: 'Password Manager - Secure Password Vault',
        description: 'Securely store and manage passwords with client-side encryption. Free password manager with vault protection.',
        keywords: ['password manager', 'password vault', 'secure passwords', 'password storage', 'encrypted vault']
    },
    'url-shortener': {
        title: 'URL Shortener - Shorten Long URLs',
        description: 'Create short URLs and track clicks. Free URL shortener tool with analytics.',
        keywords: ['url shortener', 'short url', 'link shortener', 'shorten link', 'tiny url']
    },
    'notes': {
        title: 'Notes - Quick Note Taking App',
        description: 'Create and manage notes quickly. Simple note-taking app for developers.',
        keywords: ['notes app', 'note taking', 'quick notes', 'developer notes', 'text notes']
    },
    'to-do': {
        title: 'To-Do List - Task Management App',
        description: 'Manage tasks and to-do lists efficiently. Free to-do list app for developers.',
        keywords: ['to do list', 'task manager', 'todo app', 'task list', 'productivity']
    },
    'device-info': {
        title: 'Device Info - Browser and Device Information',
        description: 'View detailed information about your browser and device. Free device info tool.',
        keywords: ['device info', 'browser info', 'user agent', 'screen resolution', 'device detection']
    },
    'ipv4-subnet-calculator': {
        title: 'IPv4 Subnet Calculator - Calculate Network Subnets',
        description: 'Calculate IPv4 subnets, network ranges, and CIDR notation. Free subnet calculator tool.',
        keywords: ['subnet calculator', 'ipv4 calculator', 'cidr calculator', 'network calculator', 'ip subnet']
    },
    'ipv4-address-converter': {
        title: 'IPv4 Address Converter - Convert IP Addresses',
        description: 'Convert IPv4 addresses between decimal, binary, and hexadecimal formats.',
        keywords: ['ip converter', 'ipv4 converter', 'ip address converter', 'decimal to binary', 'ip format']
    },
    'ipv4-range-expander': {
        title: 'IPv4 Range Expander - Expand IP Ranges',
        description: 'Expand IPv4 CIDR ranges into individual IP addresses. Free IP range expander tool.',
        keywords: ['ip range expander', 'cidr expander', 'ip list', 'subnet expander', 'ip addresses']
    },
    'chmod-calculator': {
        title: 'Chmod Calculator - Unix File Permissions',
        description: 'Calculate Unix file permissions (chmod). Convert between numeric and symbolic notation.',
        keywords: ['chmod calculator', 'file permissions', 'unix permissions', 'chmod converter', 'linux permissions']
    },
    'git-commands': {
        title: 'Git Commands Cheatsheet - Git Reference Guide',
        description: 'Comprehensive Git commands reference with examples. Quick guide for Git version control.',
        keywords: ['git commands', 'git cheatsheet', 'git reference', 'git guide', 'version control']
    },
    'http-status-codes': {
        title: 'HTTP Status Codes - Complete Reference Guide',
        description: 'Complete reference of HTTP status codes with descriptions and usage examples.',
        keywords: ['http status codes', 'http codes', 'status code reference', 'http errors', 'response codes']
    },
    'string-obfuscator': {
        title: 'String Obfuscator - Obfuscate Text Online',
        description: 'Obfuscate strings and text for code protection. Free string obfuscation tool.',
        keywords: ['string obfuscator', 'text obfuscation', 'obfuscate code', 'encode text', 'hide text']
    },
    'numeronym-generator': {
        title: 'Numeronym Generator - Create Numeronyms',
        description: 'Generate numeronyms from words (e.g., i18n, k8s). Free numeronym generator tool.',
        keywords: ['numeronym generator', 'i18n', 'k8s', 'abbreviation', 'word shortener']
    },
    'emoji-picker': {
        title: 'Emoji Picker - Copy Emojis Easily',
        description: 'Browse and copy emojis with one click. Complete emoji picker with categories.',
        keywords: ['emoji picker', 'emoji list', 'copy emoji', 'emoji search', 'emoticons']
    },
    'wifi-qr-generator': {
        title: 'WiFi QR Generator - Share WiFi with QR Code',
        description: 'Generate QR codes for WiFi networks. Share WiFi credentials easily with QR codes.',
        keywords: ['wifi qr', 'wifi qr code', 'share wifi', 'wifi password qr', 'qr wifi']
    },
    'text-statistics': {
        title: 'Text Statistics - Count Words, Characters, Lines',
        description: 'Analyze text with detailed statistics. Count words, characters, lines, and more.',
        keywords: ['text statistics', 'word counter', 'character counter', 'text analysis', 'line counter']
    },
    'ASCII-art-text-generator': {
        title: 'ASCII Art Generator - Convert Text to ASCII Art',
        description: 'Generate ASCII art from text. Create cool ASCII text art with different fonts.',
        keywords: ['ascii art', 'ascii generator', 'text art', 'ascii text', 'ascii converter']
    },
    'url-parser': {
        title: 'URL Parser - Parse and Analyze URLs',
        description: 'Parse URLs and extract components (protocol, host, path, params). Free URL parser tool.',
        keywords: ['url parser', 'parse url', 'url analyzer', 'url decoder', 'url components']
    },
    'converters': {
        title: 'Converters - Unit and Format Converters',
        description: 'Collection of conversion tools for developers. Convert units, formats, and more.',
        keywords: ['converters', 'unit converter', 'format converter', 'conversion tools', 'calculator']
    }
}

// Generate metadata for a tool page
export function generateToolMetadata(toolSlug: string): Metadata {
    const tool = toolsMetadata[toolSlug]

    if (!tool) {
        return {
            title: 'Developer Tool - MyDevTools',
            description: 'Free online developer tools and utilities.',
        }
    }

    return {
        title: tool.title,
        description: tool.description,
        keywords: tool.keywords,
        openGraph: {
            title: tool.title,
            description: tool.description,
            url: `${baseUrl}/app/${toolSlug}`,
            siteName: 'MyDevTools',
            type: 'website',
            images: [
                {
                    url: `${baseUrl}/og-image.png`,
                    width: 1200,
                    height: 630,
                    alt: tool.title,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: tool.title,
            description: tool.description,
            images: [`${baseUrl}/og-image.png`],
            creator: '@mydevtools',
        },
        alternates: {
            canonical: `${baseUrl}/app/${toolSlug}`,
        },
    }
}

// Base site metadata
export const siteMetadata = {
    name: 'MyDevTools',
    title: 'MyDevTools - Essential Tools for Developers',
    description: 'Your Ultimate Developer Toolkit. Access 40+ free online tools including JSON formatter, UUID generator, password generator, and more. Boost productivity with client-side processing.',
    url: baseUrl,
    ogImage: `${baseUrl}/og-image.png`,
    keywords: [
        'developer tools',
        'online tools',
        'json formatter',
        'uuid generator',
        'password generator',
        'base64 encoder',
        'url encoder',
        'hash generator',
        'productivity tools',
    ],
}
