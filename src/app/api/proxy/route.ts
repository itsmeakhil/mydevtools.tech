import { NextRequest, NextResponse } from 'next/server';

// Security limits
const MAX_BODY_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_RESPONSE_SIZE = 10 * 1024 * 1024; // 10MB
const REQUEST_TIMEOUT = 30000; // 30 seconds

// Headers that should be blocked or sanitized
const BLOCKED_HEADERS = [
  'host',
  'connection',
  'keep-alive',
  'transfer-encoding',
  'upgrade',
  'proxy-connection',
  'proxy-authenticate',
  'proxy-authorization',
];

// Sensitive headers that should be redacted in logs
const SENSITIVE_HEADERS = [
  'authorization',
  'cookie',
  'x-api-key',
  'api-key',
  'x-auth-token',
  'x-access-token',
  'x-csrf-token',
];

interface ProxyRequest {
  method: string;
  url: string;
  headers?: Record<string, string>;
  body?: string | FormData;
  timeout?: number;
}

/**
 * Sanitize headers by removing blocked headers and redacting sensitive ones
 */
function sanitizeHeaders(headers: Record<string, string>): Record<string, string> {
  const sanitized: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(headers)) {
    const lowerKey = key.toLowerCase();
    
    // Skip blocked headers
    if (BLOCKED_HEADERS.includes(lowerKey)) {
      continue;
    }
    
    // Redact sensitive headers (but still send them)
    if (SENSITIVE_HEADERS.includes(lowerKey)) {
      sanitized[key] = value; // Send the actual value, but we'll redact in logs
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

/**
 * Redact sensitive values for logging
 */
function redactSensitiveValue(value: string): string {
  if (!value || value.length < 8) {
    return '***';
  }
  return value.substring(0, 4) + '***' + value.substring(value.length - 4);
}

/**
 * Redact headers for logging
 */
function redactHeadersForLog(headers: Record<string, string>): Record<string, string> {
  const redacted: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(headers)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_HEADERS.includes(lowerKey)) {
      redacted[key] = redactSensitiveValue(value);
    } else {
      redacted[key] = value;
    }
  }
  
  return redacted;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as ProxyRequest;
    const { method, url, headers = {}, body: requestBody, timeout = REQUEST_TIMEOUT } = body;

    // Validate required fields
    if (!method || !url) {
      return NextResponse.json(
        { error: 'Method and URL are required' },
        { status: 400 }
      );
    }

    // Validate URL
    let targetUrl: URL;
    try {
      targetUrl = new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL' },
        { status: 400 }
      );
    }

    // Block private/internal IPs for security
    const hostname = targetUrl.hostname;
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0' ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname.startsWith('172.16.') ||
      hostname.startsWith('172.17.') ||
      hostname.startsWith('172.18.') ||
      hostname.startsWith('172.19.') ||
      hostname.startsWith('172.20.') ||
      hostname.startsWith('172.21.') ||
      hostname.startsWith('172.22.') ||
      hostname.startsWith('172.23.') ||
      hostname.startsWith('172.24.') ||
      hostname.startsWith('172.25.') ||
      hostname.startsWith('172.26.') ||
      hostname.startsWith('172.27.') ||
      hostname.startsWith('172.28.') ||
      hostname.startsWith('172.29.') ||
      hostname.startsWith('172.30.') ||
      hostname.startsWith('172.31.') ||
      hostname === '::1'
    ) {
      return NextResponse.json(
        { error: 'Private/internal IPs are not allowed' },
        { status: 403 }
      );
    }

    // Check body size if present
    if (requestBody && typeof requestBody === 'string') {
      const bodySize = new Blob([requestBody]).size;
      if (bodySize > MAX_BODY_SIZE) {
        return NextResponse.json(
          { error: `Request body too large. Maximum size is ${MAX_BODY_SIZE / 1024 / 1024}MB` },
          { status: 413 }
        );
      }
    }

    // Sanitize headers
    const sanitizedHeaders = sanitizeHeaders(headers);

    // Log request (with redacted sensitive headers)
    const redactedHeaders = redactHeadersForLog(sanitizedHeaders);
    console.log(`[Proxy] ${method} ${url}`, {
      headers: redactedHeaders,
      hasBody: !!requestBody,
    });

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      // Prepare fetch options
      const fetchOptions: RequestInit = {
        method,
        headers: sanitizedHeaders,
        signal: controller.signal,
      };

      // Add body if present
      if (requestBody) {
        if (typeof requestBody === 'string') {
          fetchOptions.body = requestBody;
        } else {
          // For FormData, we'd need to handle it differently
          // For now, we'll only support string bodies
          fetchOptions.body = requestBody;
        }
      }

      // Make the request
      const startTime = Date.now();
      const response = await fetch(url, fetchOptions);
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Check response size
      const contentLength = response.headers.get('content-length');
      if (contentLength && parseInt(contentLength) > MAX_RESPONSE_SIZE) {
        return NextResponse.json(
          { error: 'Response too large' },
          { status: 413 }
        );
      }

      // Read response body with size limit
      const responseText = await response.text();
      const responseSize = new Blob([responseText]).size;

      if (responseSize > MAX_RESPONSE_SIZE) {
        return NextResponse.json(
          { error: 'Response too large' },
          { status: 413 }
        );
      }

      // Get response headers (redact sensitive ones)
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        const lowerKey = key.toLowerCase();
        if (SENSITIVE_HEADERS.includes(lowerKey)) {
          responseHeaders[key] = redactSensitiveValue(value);
        } else {
          responseHeaders[key] = value;
        }
      });

      // Log response (with redacted sensitive headers)
      console.log(`[Proxy] ${method} ${url} - ${response.status} (${duration}ms)`, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        bodySize: responseSize,
      });

      // Return response
      return NextResponse.json({
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        body: responseText,
        time: duration,
      });
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Request timeout' },
          { status: 408 }
        );
      }
      
      throw error;
    }
  } catch (error) {
    console.error('[Proxy] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

