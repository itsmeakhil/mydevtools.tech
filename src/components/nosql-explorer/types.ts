export interface Database {
    name: string;
    sizeOnDisk: number;
    empty: boolean;
}

export interface Collection {
    name: string;
    type: string;
    options: any;
    info: {
        readOnly: boolean;
        uuid: string;
    };
    idIndex: {
        v: number;
        key: {
            _id: number;
        };
        name: string;
    };
}

export interface Document {
    _id: string;
    [key: string]: any;
}

export interface SavedConnection {
    id: string;
    userId: string;
    connectionString: string;
    name: string;
    createdAt: any;
    lastUsedAt: any;
}

export interface ConnectionState {
    isConnected: boolean;
    connectionString: string;
    databases: Database[];
    selectedDb: string | null;
    collections: Collection[];
    selectedCollection: string | null;
    documents: Document[];
    total?: number;
    loading: boolean;
    error: string | null;
}

export interface ExplorerTab {
    id: string;
    dbName: string;
    collectionName: string;
    documents: Document[];
    total: number;
    page: number;
    limit: number;
    query: string;
    loading: boolean;
    error: string | null;
}
