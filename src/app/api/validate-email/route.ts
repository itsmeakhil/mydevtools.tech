import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
        return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    try {
        const response = await fetch(
            `https://rapid-email-verifier.fly.dev/api/validate?email=${encodeURIComponent(email)}`,
            {
                headers: {
                    accept: 'application/json',
                },
            }
        );

        if (!response.ok) {
            return NextResponse.json(
                { error: 'Failed to validate email from external provider' },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Email validation proxy error:', error);
        return NextResponse.json(
            { error: 'Internal server error while validating email' },
            { status: 500 }
        );
    }
}
