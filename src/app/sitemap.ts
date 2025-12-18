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
        'color-converter',
        'converters',
        'crontab-generator',
        'html-entity-converter',
        'ipv4-address-converter',
        'json-formatter',
        'lorem-ipsum-generator',
        'notes',
        'numeronym-generator',
        'otp-generator',
        'password-generator',
        'password-manager',
        'qr-code-generator',
        'string-case-converter',
        'timestamp-converter',
        'to-do',
        'url-encoder',

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
