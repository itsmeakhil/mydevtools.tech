/**
 * Utilities for redacting sensitive information in UI and logs
 */

// Sensitive headers that should be redacted
const SENSITIVE_HEADERS = [
  'authorization',
  'cookie',
  'x-api-key',
  'api-key',
  'x-auth-token',
  'x-access-token',
  'x-csrf-token',
  'x-session-id',
  'set-cookie',
];

/**
 * Redact a sensitive value, showing only first 4 and last 4 characters
 */
export function redactValue(value: string): string {
  if (!value || value.length === 0) {
    return '***';
  }
  if (value.length <= 8) {
    return '***';
  }
  return value.substring(0, 4) + '***' + value.substring(value.length - 4);
}

/**
 * Check if a header key is sensitive
 */
export function isSensitiveHeader(key: string): boolean {
  return SENSITIVE_HEADERS.includes(key.toLowerCase());
}

/**
 * Redact sensitive headers in a headers object
 */
export function redactHeaders(headers: Record<string, string>): Record<string, string> {
  const redacted: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(headers)) {
    if (isSensitiveHeader(key)) {
      redacted[key] = redactValue(value);
    } else {
      redacted[key] = value;
    }
  }
  
  return redacted;
}

/**
 * Redact sensitive values in a KeyValuePair array (for headers/params)
 */
export function redactKeyValuePairs(pairs: Array<{ key: string; value: string }>): Array<{ key: string; value: string }> {
  return pairs.map(pair => ({
    ...pair,
    value: isSensitiveHeader(pair.key) ? redactValue(pair.value) : pair.value,
  }));
}

/**
 * Redact auth data for display
 */
export function redactAuthData(authData: {
  token?: string;
  username?: string;
  password?: string;
  key?: string;
  value?: string;
  addTo?: 'header' | 'query';
}): typeof authData {
  return {
    ...authData,
    token: authData.token ? redactValue(authData.token) : authData.token,
    password: authData.password ? redactValue(authData.password) : authData.password,
    value: authData.value ? redactValue(authData.value) : authData.value,
  };
}

/**
 * Redact URL query parameters that might contain sensitive data
 */
export function redactUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const sensitiveParams = ['token', 'key', 'api_key', 'apikey', 'auth', 'password', 'secret'];
    
    urlObj.searchParams.forEach((value, key) => {
      if (sensitiveParams.includes(key.toLowerCase())) {
        urlObj.searchParams.set(key, redactValue(value));
      }
    });
    
    return urlObj.toString();
  } catch {
    // If URL parsing fails, return as-is
    return url;
  }
}

