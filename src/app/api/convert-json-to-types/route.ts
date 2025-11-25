import { NextRequest, NextResponse } from 'next/server';
import { quicktype, InputData, jsonInputForTargetLanguage } from 'quicktype-core';

export async function POST(request: NextRequest) {
    try {
        const { jsonInput, targetLanguage } = await request.json();

        if (!jsonInput || !targetLanguage) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const jsonInputData = new InputData();
        const source = { name: "GeneratedType", samples: [jsonInput] };

        await jsonInputData.addSource(
            'json',
            source,
            () => jsonInputForTargetLanguage(targetLanguage)
        );

        const { lines } = await quicktype({
            inputData: jsonInputData,
            lang: targetLanguage,
            rendererOptions: {
                'just-types': 'true',
                'features': 'just-types'
            }
        });

        return NextResponse.json({ output: lines.join('\n') });
    } catch (error) {
        console.error('Conversion error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to generate types' },
            { status: 500 }
        );
    }
}
