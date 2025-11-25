import React from 'react';
import Converter from '@/components/json-to-types/converter';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'JSON to Types Converter | MyDevTools',
    description: 'Convert JSON to TypeScript interfaces, Swift structs, Go structs, C# classes, and more instantly.',
};

export default function JsonToTypesPage() {
    return (
        <div className="h-full flex flex-col">
            <div className="p-6 pb-0">
                <h1 className="text-2xl font-bold tracking-tight">JSON to Types Converter</h1>
                <p className="text-muted-foreground mt-2">
                    Instantly generate strongly-typed models from your JSON data for TypeScript, Swift, Go, Python, and more.
                </p>
            </div>
            <Converter />
        </div>
    );
}
