export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
export type AuthType = 'none' | 'bearer' | 'basic' | 'apiKey';
export type BodyType = 'json' | 'text' | 'form-data' | 'x-www-form-urlencoded' | 'raw';
export type ProtocolType = 'REST' | 'WebSocket' | 'GraphQL';

export interface KeyValuePair {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
  description?: string;
}

export interface SavedRequest {
  id: string;
  name: string;
  method: HttpMethod;
  url: string;
  headers: KeyValuePair[];
  params: KeyValuePair[];
  body: string;
  bodyType: BodyType;
  authType: AuthType;
  authData: {
    token?: string;
    username?: string;
    password?: string;
    key?: string;
    value?: string;
    addTo?: 'header' | 'query';
  };
  collectionId?: string;
  timestamp: number;
}

export interface RequestTab {
  id: string;
  name: string;
  method: HttpMethod;
  url: string;
  headers: KeyValuePair[];
  params: KeyValuePair[];
  body: string;
  bodyType: BodyType;
  authType: AuthType;
  authData: SavedRequest['authData'];
  isModified: boolean;
  savedRequestId?: string;
}

export interface ApiResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  time: number;
}

export interface Collection {
  id: string;
  name: string;
  requests: SavedRequest[];
  collections?: Collection[];
}

export const defaultHeaders: KeyValuePair[] = [
  { id: '1', key: 'Content-Type', value: 'application/json', enabled: true },
];

