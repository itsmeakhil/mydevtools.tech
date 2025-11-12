import { HttpMethod, RequestTab, Environment } from './types';

export const getMethodColor = (method: HttpMethod): string => {
  const colors: Record<HttpMethod, string> = {
    GET: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
    POST: 'bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30',
    PUT: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
    PATCH: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30',
    DELETE: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30',
    HEAD: 'bg-gray-500/15 text-gray-600 dark:text-gray-400 border-gray-500/30',
    OPTIONS: 'bg-gray-500/15 text-gray-600 dark:text-gray-400 border-gray-500/30',
  };
  return colors[method] || colors.GET;
};

export const getStatusColor = (status: number): string => {
  if (status >= 200 && status < 300) return 'bg-green-500/20 text-green-600 dark:text-green-400';
  if (status >= 300 && status < 400) return 'bg-blue-500/20 text-blue-600 dark:text-blue-400';
  if (status >= 400 && status < 500) return 'bg-orange-500/20 text-orange-600 dark:text-orange-400';
  if (status >= 500) return 'bg-red-500/20 text-red-600 dark:text-red-400';
  return 'bg-gray-500/20 text-gray-600 dark:text-gray-400';
};

export const buildUrl = (activeTab: RequestTab): string => {
  let url = activeTab.url;
  const enabledParams = activeTab.params.filter(p => p.enabled && p.key.trim());
  
  // Add API key to query params if configured
  if (activeTab.authType === 'apiKey' && activeTab.authData.addTo === 'query' && activeTab.authData.key && activeTab.authData.value) {
    enabledParams.push({
      id: 'api-key',
      key: activeTab.authData.key,
      value: activeTab.authData.value,
      enabled: true,
    });
  }
  
  if (enabledParams.length > 0) {
    const params = new URLSearchParams();
    enabledParams.forEach(p => {
      params.append(p.key, p.value);
    });
    const separator = url.includes('?') ? '&' : '?';
    url += separator + params.toString();
  }
  
  return url;
};

export const buildHeaders = (activeTab: RequestTab): Record<string, string> => {
  const headers: Record<string, string> = {};
  
  // Add enabled headers
  activeTab.headers
    .filter(h => h.enabled && h.key.trim())
    .forEach(h => {
      headers[h.key.trim()] = h.value.trim();
    });

  // Add auth headers
  if (activeTab.authType === 'bearer' && activeTab.authData.token) {
    headers['Authorization'] = `Bearer ${activeTab.authData.token}`;
  } else if (activeTab.authType === 'basic' && activeTab.authData.username && activeTab.authData.password) {
    const credentials = btoa(`${activeTab.authData.username}:${activeTab.authData.password}`);
    headers['Authorization'] = `Basic ${credentials}`;
  } else if (activeTab.authType === 'apiKey' && activeTab.authData.key && activeTab.authData.value) {
    if (activeTab.authData.addTo === 'header') {
      headers[activeTab.authData.key] = activeTab.authData.value;
    }
  }

  return headers;
};

export const buildBody = (activeTab: RequestTab): string | FormData | URLSearchParams | undefined => {
  if (!['POST', 'PUT', 'PATCH'].includes(activeTab.method)) return undefined;

  if (activeTab.bodyType === 'json' || activeTab.bodyType === 'text' || activeTab.bodyType === 'raw') {
    return activeTab.body;
  } else if (activeTab.bodyType === 'form-data') {
    const formData = new FormData();
    try {
      const pairs = activeTab.body.split('\n').filter(p => p.trim());
      pairs.forEach(pair => {
        const [key, value] = pair.split('=').map(s => s.trim());
        if (key) formData.append(key, value || '');
      });
    } catch {
      // Fallback to simple parsing
    }
    return formData;
  } else if (activeTab.bodyType === 'x-www-form-urlencoded') {
    const params = new URLSearchParams();
    try {
      const pairs = activeTab.body.split('\n').filter(p => p.trim());
      pairs.forEach(pair => {
        const [key, value] = pair.split('=').map(s => s.trim());
        if (key) params.append(key, value || '');
      });
    } catch {
      // Fallback
    }
    return params.toString();
  }

  return undefined;
};

/**
 * Interpolates environment variables in a string
 * Supports ${VAR} and {{VAR}} syntax
 */
export const interpolateVariables = (text: string, environment?: Environment): string => {
  if (!environment || !text) return text;

  let result = text;
  const variables = environment.variables || {};

  // Replace ${VAR} and {{VAR}} patterns
  result = result.replace(/\$\{([^}]+)\}/g, (match, varName) => {
    const trimmedName = varName.trim();
    return variables[trimmedName] !== undefined ? variables[trimmedName] : match;
  });

  result = result.replace(/\{\{([^}]+)\}\}/g, (match, varName) => {
    const trimmedName = varName.trim();
    return variables[trimmedName] !== undefined ? variables[trimmedName] : match;
  });

  return result;
};

/**
 * Interpolates variables in KeyValuePair array
 */
export const interpolateKeyValuePairs = <T extends { key: string; value: string }>(
  pairs: T[],
  environment?: Environment
): T[] => {
  if (!environment) return pairs;

  return pairs.map(pair => ({
    ...pair,
    key: interpolateVariables(pair.key, environment),
    value: interpolateVariables(pair.value, environment),
  }));
};

/**
 * Builds URL with environment variable interpolation
 */
export const buildUrlWithEnv = (activeTab: RequestTab, environment?: Environment): string => {
  let url = interpolateVariables(activeTab.url, environment);
  const enabledParams = activeTab.params.filter(p => p.enabled && p.key.trim());

  // Interpolate params with environment variables
  const interpolatedParams = interpolateKeyValuePairs(enabledParams, environment);

  // Add API key to query params if configured
  if (activeTab.authType === 'apiKey' && activeTab.authData.addTo === 'query' && activeTab.authData.key && activeTab.authData.value) {
    const authKey = interpolateVariables(activeTab.authData.key, environment);
    const authValue = interpolateVariables(activeTab.authData.value, environment);
    interpolatedParams.push({
      key: authKey,
      value: authValue,
    });
  }

  if (interpolatedParams.length > 0) {
    const params = new URLSearchParams();
    interpolatedParams.forEach(p => {
      params.append(p.key, p.value);
    });
    const separator = url.includes('?') ? '&' : '?';
    url += separator + params.toString();
  }

  return url;
};

/**
 * Builds headers with environment variable interpolation
 */
export const buildHeadersWithEnv = (activeTab: RequestTab, environment?: Environment): Record<string, string> => {
  const headers: Record<string, string> = {};

  // Add enabled headers with interpolation
  const enabledHeaders = activeTab.headers.filter(h => h.enabled && h.key.trim());
  const interpolatedHeaders = interpolateKeyValuePairs(enabledHeaders, environment);

  interpolatedHeaders.forEach(h => {
    headers[h.key.trim()] = h.value.trim();
  });

  // Add auth headers with interpolation
  if (activeTab.authType === 'bearer' && activeTab.authData.token) {
    const token = interpolateVariables(activeTab.authData.token, environment);
    headers['Authorization'] = `Bearer ${token}`;
  } else if (activeTab.authType === 'basic' && activeTab.authData.username && activeTab.authData.password) {
    const username = interpolateVariables(activeTab.authData.username, environment);
    const password = interpolateVariables(activeTab.authData.password, environment);
    const credentials = btoa(`${username}:${password}`);
    headers['Authorization'] = `Basic ${credentials}`;
  } else if (activeTab.authType === 'apiKey' && activeTab.authData.key && activeTab.authData.value) {
    if (activeTab.authData.addTo === 'header') {
      const key = interpolateVariables(activeTab.authData.key, environment);
      const value = interpolateVariables(activeTab.authData.value, environment);
      headers[key] = value;
    }
  }

  return headers;
};

/**
 * Builds body with environment variable interpolation
 */
export const buildBodyWithEnv = (activeTab: RequestTab, environment?: Environment): string | FormData | URLSearchParams | undefined => {
  if (!['POST', 'PUT', 'PATCH'].includes(activeTab.method)) return undefined;

  const interpolatedBody = interpolateVariables(activeTab.body, environment);

  if (activeTab.bodyType === 'json' || activeTab.bodyType === 'text' || activeTab.bodyType === 'raw') {
    return interpolatedBody;
  } else if (activeTab.bodyType === 'form-data') {
    const formData = new FormData();
    try {
      const pairs = interpolatedBody.split('\n').filter(p => p.trim());
      pairs.forEach(pair => {
        const [key, value] = pair.split('=').map(s => s.trim());
        if (key) formData.append(key, value || '');
      });
    } catch {
      // Fallback to simple parsing
    }
    return formData;
  } else if (activeTab.bodyType === 'x-www-form-urlencoded') {
    const params = new URLSearchParams();
    try {
      const pairs = interpolatedBody.split('\n').filter(p => p.trim());
      pairs.forEach(pair => {
        const [key, value] = pair.split('=').map(s => s.trim());
        if (key) params.append(key, value || '');
      });
    } catch {
      // Fallback
    }
    return params.toString();
  }

  return undefined;
};

