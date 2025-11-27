import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const connectionString = searchParams.get('connectionString');
    const dbName = searchParams.get('dbName');

    if (!connectionString || !dbName) {
        return NextResponse.json(
            { error: 'Connection string and database name are required' },
            { status: 400 }
        );
    }

    try {
        const client = new MongoClient(connectionString);
        await client.connect();

        const db = client.db(dbName);
        const collections = await db.listCollections().toArray();

        await client.close();

        return NextResponse.json({ collections });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Failed to list collections' },
            { status: 500 }
        );
    }
}
