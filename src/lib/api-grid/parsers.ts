import { HttpMethod, BodyType, AuthType, KeyValuePair, RequestTab, SavedRequest, Collection } from './types';

/**
 * Parse HAR (HTTP Archive) format and extract requests
 */
export function parseHAR(harData: any): Partial<RequestTab>[] {
  if (!harData.log || !harData.log.entries || !Array.isArray(harData.log.entries)) {
    throw new Error('Invalid HAR format: missing log.entries');
  }

  const requests: Partial<RequestTab>[] = [];

  for (const entry of harData.log.entries) {
    if (!entry.request) continue;

    const request = entry.request;
    const response = entry.response;

    // Extract method
    const method = (request.method?.toUpperCase() || 'GET') as HttpMethod;

    // Extract URL
    const url = request.url || '';

    // Extract headers
    const headers: KeyValuePair[] = [];
    if (Array.isArray(request.headers)) {
      for (const header of request.headers) {
        if (header.name && header.value !== undefined) {
          headers.push({
            id: Date.now().toString() + Math.random(),
            key: header.name,
            value: header.value,
            enabled: true,
          });
        }
      }
    }

    // Extract query parameters
    const params: KeyValuePair[] = [];
    if (Array.isArray(request.queryString)) {
      for (const param of request.queryString) {
        if (param.name) {
          params.push({
            id: Date.now().toString() + Math.random(),
            key: param.name,
            value: param.value || '',
            enabled: true,
          });
        }
      }
    }

    // Extract body
    let body = '';
    let bodyType: BodyType = 'json';
    
    if (request.postData) {
      body = request.postData.text || '';
      
      // Determine body type from Content-Type header
      const contentTypeHeader = headers.find(h => 
        h.key.toLowerCase() === 'content-type'
      );
      
      if (contentTypeHeader) {
        const contentType = contentTypeHeader.value.toLowerCase();
        if (contentType.includes('application/json')) {
          bodyType = 'json';
        } else if (contentType.includes('application/x-www-form-urlencoded')) {
          bodyType = 'x-www-form-urlencoded';
        } else if (contentType.includes('multipart/form-data')) {
          bodyType = 'form-data';
        } else {
          bodyType = 'text';
        }
      } else if (request.postData.mimeType) {
        const mimeType = request.postData.mimeType.toLowerCase();
        if (mimeType.includes('application/json')) {
          bodyType = 'json';
        } else if (mimeType.includes('application/x-www-form-urlencoded')) {
          bodyType = 'x-www-form-urlencoded';
        } else if (mimeType.includes('multipart/form-data')) {
          bodyType = 'form-data';
        } else {
          bodyType = 'text';
        }
      } else {
        // Try to detect JSON
        try {
          const trimmedBody = body.trim();
          if (trimmedBody.startsWith('{') || trimmedBody.startsWith('[')) {
            JSON.parse(trimmedBody);
            bodyType = 'json';
          }
        } catch {
          bodyType = 'text';
        }
      }
    }

    // Extract auth from headers
    let authType: AuthType = 'none';
    const authData: SavedRequest['authData'] = {};
    
    const authHeader = headers.find(h => 
      h.key.toLowerCase() === 'authorization'
    );
    
    if (authHeader) {
      const authValue = authHeader.value;
      if (authValue.startsWith('Bearer ')) {
        authType = 'bearer';
        authData.token = authValue.replace(/^Bearer\s+/i, '');
      } else if (authValue.startsWith('Basic ')) {
        authType = 'basic';
        try {
          const decoded = atob(authValue.replace(/^Basic\s+/i, ''));
          const [username, password] = decoded.split(':');
          authData.username = username || '';
          authData.password = password || '';
        } catch (e) {
          // If decoding fails, just store the token
        }
      }
    }

    // Generate request name from URL and method
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    const requestName = `${method} ${pathParts[pathParts.length - 1] || urlObj.pathname || 'Request'}`;

    requests.push({
      method,
      url,
      headers,
      params,
      body,
      bodyType,
      authType,
      authData,
    });
  }

  return requests;
}

/**
 * Parse OpenAPI specification and create collections with requests
 */
export function parseOpenAPI(openApiData: any, collectionName?: string): Collection {
  if (!openApiData.paths || typeof openApiData.paths !== 'object') {
    throw new Error('Invalid OpenAPI format: missing paths');
  }

  const collection: Collection = {
    id: Date.now().toString(),
    name: collectionName || openApiData.info?.title || 'Imported API',
    requests: [],
    collections: [],
  };

  // Group requests by tags
  const requestsByTag: Record<string, SavedRequest[]> = {};
  const untaggedRequests: SavedRequest[] = [];

  // Iterate through paths
  for (const [path, pathItem] of Object.entries(openApiData.paths)) {
    if (!pathItem || typeof pathItem !== 'object') continue;

    // Iterate through HTTP methods
    const methods: HttpMethod[] = ['get', 'post', 'put', 'delete', 'patch', 'head', 'options'];
    
    for (const method of methods) {
      const operation = (pathItem as any)[method];
      if (!operation) continue;

      // Extract operation details
      const operationId = operation.operationId || `${method}_${path.replace(/\//g, '_')}`;
      const summary = operation.summary || operationId;
      const tags = operation.tags || [];
      const parameters = operation.parameters || [];
      const requestBody = operation.requestBody;

      // Build URL (use servers if available)
      let baseUrl = '';
      if (openApiData.servers && Array.isArray(openApiData.servers) && openApiData.servers.length > 0) {
        baseUrl = openApiData.servers[0].url || '';
        // Remove trailing slash from baseUrl if present
        if (baseUrl.endsWith('/')) {
          baseUrl = baseUrl.slice(0, -1);
        }
      }
      // Ensure path starts with /
      const normalizedPath = path.startsWith('/') ? path : '/' + path;
      const fullUrl = baseUrl ? baseUrl + normalizedPath : normalizedPath;

      // Extract headers
      const headers: KeyValuePair[] = [];
      const params: KeyValuePair[] = [];

      // Process parameters
      for (const param of parameters) {
        if (param.in === 'header') {
          headers.push({
            id: Date.now().toString() + Math.random(),
            key: param.name,
            value: param.schema?.default || param.example || '',
            enabled: !param.required || false,
          });
        } else if (param.in === 'query') {
          params.push({
            id: Date.now().toString() + Math.random(),
            key: param.name,
            value: param.schema?.default || param.example || '',
            enabled: !param.required || false,
          });
        }
      }

      // Extract body
      let body = '';
      let bodyType: BodyType = 'json';

      if (requestBody && requestBody.content) {
        const contentTypes = Object.keys(requestBody.content);
        const contentType = contentTypes[0] || 'application/json';
        
        if (contentType.includes('application/json')) {
          bodyType = 'json';
          const schema = requestBody.content[contentType]?.schema;
          if (schema) {
            // Generate example JSON from schema
            body = generateExampleFromSchema(schema);
          }
        } else if (contentType.includes('application/x-www-form-urlencoded')) {
          bodyType = 'x-www-form-urlencoded';
        } else if (contentType.includes('multipart/form-data')) {
          bodyType = 'form-data';
        }

        // Add Content-Type header
        headers.push({
          id: Date.now().toString() + Math.random(),
          key: 'Content-Type',
          value: contentType,
          enabled: true,
        });
      }

      // Extract security/auth
      let authType: AuthType = 'none';
      const authData: SavedRequest['authData'] = {};

      if (operation.security || openApiData.security) {
        const security = operation.security || openApiData.security;
        if (Array.isArray(security) && security.length > 0) {
          const securityScheme = security[0];
          const schemeName = Object.keys(securityScheme)[0];
          const scheme = openApiData.components?.securitySchemes?.[schemeName];

          if (scheme) {
            if (scheme.type === 'http' && scheme.scheme === 'bearer') {
              authType = 'bearer';
              authData.token = '';
            } else if (scheme.type === 'http' && scheme.scheme === 'basic') {
              authType = 'basic';
              authData.username = '';
              authData.password = '';
            } else if (scheme.type === 'apiKey') {
              authType = 'apiKey';
              authData.key = scheme.name || 'X-API-Key';
              authData.value = '';
              authData.addTo = scheme.in === 'query' ? 'query' : 'header';
            }
          }
        }
      }

      // Create saved request
      const savedRequest: SavedRequest = {
        id: Date.now().toString() + Math.random(),
        name: summary,
        method: method.toUpperCase() as HttpMethod,
        url: fullUrl,
        headers,
        params,
        body,
        bodyType,
        authType,
        authData,
        timestamp: Date.now(),
      };

      // Group by tags
      if (tags.length > 0) {
        for (const tag of tags) {
          if (!requestsByTag[tag]) {
            requestsByTag[tag] = [];
          }
          requestsByTag[tag].push(savedRequest);
        }
      } else {
        untaggedRequests.push(savedRequest);
      }
    }
  }

  // Create collections for each tag
  for (const [tag, requests] of Object.entries(requestsByTag)) {
    collection.collections!.push({
      id: Date.now().toString() + Math.random(),
      name: tag,
      requests,
      collections: [],
    });
  }

  // Add untagged requests to root collection
  collection.requests = untaggedRequests;

  return collection;
}

/**
 * Generate example JSON from OpenAPI schema
 */
function generateExampleFromSchema(schema: any): string {
  if (schema.example !== undefined) {
    return JSON.stringify(schema.example, null, 2);
  }

  if (schema.type === 'object' && schema.properties) {
    const example: any = {};
    for (const [key, prop] of Object.entries(schema.properties as any)) {
      const propSchema = prop as any;
      if (propSchema.example !== undefined) {
        example[key] = propSchema.example;
      } else if (propSchema.type === 'string') {
        example[key] = propSchema.default || '';
      } else if (propSchema.type === 'number' || propSchema.type === 'integer') {
        example[key] = propSchema.default || 0;
      } else if (propSchema.type === 'boolean') {
        example[key] = propSchema.default || false;
      } else if (propSchema.type === 'array') {
        example[key] = [];
      } else if (propSchema.type === 'object') {
        example[key] = {};
      }
    }
    return JSON.stringify(example, null, 2);
  }

  if (schema.type === 'array' && schema.items) {
    const itemExample = generateExampleFromSchema(schema.items);
    try {
      const parsed = JSON.parse(itemExample);
      return JSON.stringify([parsed], null, 2);
    } catch {
      return JSON.stringify([], null, 2);
    }
  }

  return '{}';
}

