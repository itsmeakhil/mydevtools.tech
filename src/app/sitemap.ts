import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mydevtools.tech'

    // Main pages
    const mainPages = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 1,
        },
        {
            url: `${baseUrl}/login`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.5,
        },
        {
            url: `${baseUrl}/dashboard`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        },
    ]

    // Tool pages - automatically include all tools
    const toolPages = [
        'ASCII-art-text-generator',
        'base64-encoder',
        'chmod-calculator',
        'color-converter',
        'converters',
        'crontab-generator',
        'device-info',
        'emoji-picker',
        'encryption',
        'git-commands',
        'hash-generator',
        'html-entity-converter',
        'http-status-codes',
        'ipv4-address-converter',
        'ipv4-range-expander',
        'ipv4-subnet-calculator',
        'json-diff',
        'json-formatter',
        'jwt-parser',
        'lorem-ipsum-generator',
        'markdown-preview',
        'notes',
        'numeronym-generator',
        'otp-generator',
        'password-generator',
        'password-manager',
        'qr-code-generator',
        'regex-cheatsheet',
        'string-case-converter',
        'string-obfuscator',
        'text-diff',
        'text-statistics',
        'timestamp-converter',
        'to-do',
        'url-encoder',
        'url-parser',

        'uuid-generator',
        'wifi-qr-generator',
    ].map((tool) => ({
        url: `${baseUrl}/app/${tool}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
    }))

    return [...mainPages, ...toolPages]
}
