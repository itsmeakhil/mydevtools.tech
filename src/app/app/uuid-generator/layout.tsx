import { Metadata } from 'next'
import { generateToolMetadata } from '@/lib/metadata'

export const metadata: Metadata = generateToolMetadata('uuid-generator')

export default function Layout({ children }: { children: React.ReactNode }) {
    return children
}
