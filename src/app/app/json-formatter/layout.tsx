import { Metadata } from 'next'
import { generateToolMetadata } from '@/lib/metadata'

export const metadata: Metadata = generateToolMetadata('json-formatter')

export default function Layout({ children }: { children: React.ReactNode }) {
    return children
}
