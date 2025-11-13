import { RequestTab, HttpMethod } from './types';
import { buildUrl, buildHeaders, buildBody } from './helpers';

export type SnippetLanguage = 'curl' | 'javascript' | 'axios' | 'python' | 'go';

export interface CodeSnippet {
  language: SnippetLanguage;
  label: string;
  code: string;
}

/**
 * Generate cURL command from request tab
 */
function generateCurl(tab: RequestTab, baseUrl?: string): string {
  const url = baseUrl ? `${baseUrl}${tab.url}` : buildUrl(tab);
  const headers = buildHeaders(tab);
  const body = buildBody(tab);

  let curl = `curl -X ${tab.method}`;

  // Add headers
  Object.entries(headers).forEach(([key, value]) => {
    curl += ` \\\n  -H "${key}: ${value}"`;
  });

  // Add body for methods that support it
  if (['POST', 'PUT', 'PATCH'].includes(tab.method) && body) {
    if (typeof body === 'string') {
      // Escape quotes in body
      const escapedBody = body.replace(/"/g, '\\"');
      curl += ` \\\n  -d "${escapedBody}"`;
    }
  }

  curl += ` \\\n  "${url}"`;

  return curl;
}

/**
 * Generate JavaScript fetch code
 */
function generateJavaScript(tab: RequestTab, baseUrl?: string): string {
  const url = baseUrl ? `${baseUrl}${tab.url}` : buildUrl(tab);
  const headers = buildHeaders(tab);
  const body = buildBody(tab);

  // Build headers object
  const headersEntries = Object.entries(headers);
  const headersObj = headersEntries.length > 0
    ? headersEntries
        .map(([key, value]) => `    "${key}": "${value.replace(/"/g, '\\"')}"`)
        .join(',\n')
    : '';

  // Build fetch options
  const options: string[] = [];
  options.push(`method: '${tab.method}'`);
  
  if (headersObj) {
    options.push(`headers: {\n${headersObj}\n  }`);
  }

  if (['POST', 'PUT', 'PATCH'].includes(tab.method) && body) {
    if (typeof body === 'string') {
      // Try to format JSON if it's JSON
      try {
        const parsed = JSON.parse(body);
        // Format the object nicely for the code snippet
        const objString = JSON.stringify(parsed, null, 2)
          .split('\n')
          .map((line, idx) => idx === 0 ? line : '    ' + line)
          .join('\n');
        options.push(`body: JSON.stringify(${objString})`);
      } catch {
        options.push(`body: ${JSON.stringify(body)}`);
      }
    }
  }

  const optionsStr = options.join(',\n  ');

  const code = `fetch('${url}', {\n  ${optionsStr}\n})\n  .then(response => response.json())\n  .then(data => console.log(data))\n  .catch(error => console.error('Error:', error));`;

  return code;
}

/**
 * Generate Axios code
 */
function generateAxios(tab: RequestTab, baseUrl?: string): string {
  const url = baseUrl ? `${baseUrl}${tab.url}` : buildUrl(tab);
  const headers = buildHeaders(tab);
  const body = buildBody(tab);

  // Build headers object
  const headersEntries = Object.entries(headers);
  const headersObj = headersEntries.length > 0
    ? headersEntries
        .map(([key, value]) => `      "${key}": "${value.replace(/"/g, '\\"')}"`)
        .join(',\n')
    : '';

  // Build config object
  const config: string[] = [];
  if (headersObj) {
    config.push(`headers: {\n${headersObj}\n    }`);
  }

  if (['POST', 'PUT', 'PATCH'].includes(tab.method) && body) {
    if (typeof body === 'string') {
      try {
        const parsed = JSON.parse(body);
        // Format the object nicely for the code snippet
        const objString = JSON.stringify(parsed, null, 2)
          .split('\n')
          .map((line, idx) => idx === 0 ? line : '      ' + line)
          .join('\n');
        config.push(`data: ${objString}`);
      } catch {
        config.push(`data: ${JSON.stringify(body)}`);
      }
    }
  }

  const configStr = config.length > 0 ? `,\n  ${config.join(',\n  ')}` : '';

  const code = `axios.${tab.method.toLowerCase()}('${url}'${configStr})\n  .then(response => {\n    console.log(response.data);\n  })\n  .catch(error => {\n    console.error('Error:', error);\n  });`;

  return code;
}

/**
 * Generate Python requests code
 */
function generatePython(tab: RequestTab, baseUrl?: string): string {
  const url = baseUrl ? `${baseUrl}${tab.url}` : buildUrl(tab);
  const headers = buildHeaders(tab);
  const body = buildBody(tab);

  let code = 'import requests\n\n';

  // Build headers dict
  const headersDict = Object.entries(headers)
    .map(([key, value]) => `    "${key}": "${value}"`)
    .join(',\n');

  // Build params dict (for GET requests)
  const params = tab.params.filter(p => p.enabled && p.key.trim());
  const paramsDict = params.length > 0
    ? params.map(p => `    "${p.key}": "${p.value}"`).join(',\n')
    : '';

  // Build request
  const method = tab.method.toLowerCase();
  let requestCode = '';

  if (['POST', 'PUT', 'PATCH'].includes(tab.method) && body) {
    if (typeof body === 'string') {
      try {
        const parsed = JSON.parse(body);
        const formatted = JSON.stringify(parsed, null, 2);
        requestCode = `response = requests.${method}(
    '${url}',
    headers={\n${headersDict}\n    },\n    json=${formatted}
)`;
      } catch {
        requestCode = `response = requests.${method}(
    '${url}',
    headers={\n${headersDict}\n    },\n    data='${body.replace(/'/g, "\\'")}'
)`;
      }
    } else {
      requestCode = `response = requests.${method}(
    '${url}',
    headers={\n${headersDict}\n    }
)`;
    }
  } else if (paramsDict) {
    requestCode = `response = requests.${method}(
    '${url}',
    headers={\n${headersDict}\n    },\n    params={\n${paramsDict}\n    }
)`;
  } else {
    requestCode = `response = requests.${method}(
    '${url}',
    headers={\n${headersDict}\n    }
)`;
  }

  code += requestCode;
  code += '\n\nprint(response.json())';

  return code;
}

/**
 * Generate Go net/http code
 */
function generateGo(tab: RequestTab, baseUrl?: string): string {
  const url = baseUrl ? `${baseUrl}${tab.url}` : buildUrl(tab);
  const headers = buildHeaders(tab);
  const body = buildBody(tab);

  let code = 'package main\n\n';
  code += 'import (\n';
  code += '    "bytes"\n';
  code += '    "encoding/json"\n';
  code += '    "fmt"\n';
  code += '    "net/http"\n';
  code += ')\n\n';
  code += 'func main() {\n';

  // Build URL
  code += `    url := "${url}"\n\n`;

  // Build body
  if (['POST', 'PUT', 'PATCH'].includes(tab.method) && body) {
    if (typeof body === 'string') {
      try {
        const parsed = JSON.parse(body);
        const jsonBytes = JSON.stringify(parsed);
        code += `    jsonData := ${jsonBytes}\n`;
        code += '    jsonBytes, err := json.Marshal(jsonData)\n';
        code += '    if err != nil {\n';
        code += '        fmt.Println("Error:", err)\n';
        code += '        return\n';
        code += '    }\n\n';
        code += '    req, err := http.NewRequest("' + tab.method + '", url, bytes.NewBuffer(jsonBytes))\n';
      } catch {
        code += `    body := "${body.replace(/"/g, '\\"')}"\n`;
        code += '    req, err := http.NewRequest("' + tab.method + '", url, bytes.NewBufferString(body))\n';
      }
    } else {
      code += '    req, err := http.NewRequest("' + tab.method + '", url, nil)\n';
    }
  } else {
    code += '    req, err := http.NewRequest("' + tab.method + '", url, nil)\n';
  }

  code += '    if err != nil {\n';
  code += '        fmt.Println("Error:", err)\n';
  code += '        return\n';
  code += '    }\n\n';

  // Add headers
  Object.entries(headers).forEach(([key, value]) => {
    code += `    req.Header.Set("${key}", "${value}")\n`;
  });

  code += '\n';
  code += '    client := &http.Client{}\n';
  code += '    resp, err := client.Do(req)\n';
  code += '    if err != nil {\n';
  code += '        fmt.Println("Error:", err)\n';
  code += '        return\n';
  code += '    }\n';
  code += '    defer resp.Body.Close()\n\n';
  code += '    var result map[string]interface{}\n';
  code += '    json.NewDecoder(resp.Body).Decode(&result)\n';
  code += '    fmt.Println(result)\n';
  code += '}';

  return code;
}

/**
 * Generate all code snippets for a request
 */
export function generateSnippets(tab: RequestTab, baseUrl?: string): CodeSnippet[] {
  return [
    {
      language: 'curl',
      label: 'cURL',
      code: generateCurl(tab, baseUrl),
    },
    {
      language: 'javascript',
      label: 'JavaScript (fetch)',
      code: generateJavaScript(tab, baseUrl),
    },
    {
      language: 'axios',
      label: 'Axios',
      code: generateAxios(tab, baseUrl),
    },
    {
      language: 'python',
      label: 'Python (requests)',
      code: generatePython(tab, baseUrl),
    },
    {
      language: 'go',
      label: 'Go (net/http)',
      code: generateGo(tab, baseUrl),
    },
  ];
}

