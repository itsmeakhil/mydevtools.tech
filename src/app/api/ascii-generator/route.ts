import { NextRequest, NextResponse } from 'next/server';
import figlet from 'figlet';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { text, font, width } = body;

        if (!text) {
            return NextResponse.json(
                { error: 'Text is required' },
                { status: 400 }
            );
        }

        // Use a promise wrapper for figlet
        const generateAscii = (txt: string, fontName: string, w: number): Promise<string> => {
            return new Promise((resolve, reject) => {
                figlet.text(
                    txt,
                    {
                        font: fontName as figlet.Fonts,
                        width: w || 80,
                        whitespaceBreak: true,
                    },
                    (err, data) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(data || '');
                        }
                    }
                );
            });
        };

        const art = await generateAscii(text, font || 'Standard', width);

        return NextResponse.json({ art });
    } catch (error) {
        console.error('ASCII generation error:', error);
        return NextResponse.json(
            { error: 'Failed to generate ASCII art' },
            { status: 500 }
        );
    }
}
