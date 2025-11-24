import { Metadata } from 'next'
import { generateToolMetadata } from '@/lib/metadata'

export const metadata: Metadata = generateToolMetadata('hash-generator')

export default function Layout({ children }: { children: React.ReactNode }) {
    return children
}
