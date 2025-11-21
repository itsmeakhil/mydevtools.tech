export type EditorMode = 'text' | 'tree' | 'table';

export type JSONValue = string | number | boolean | null | JSONObject | JSONArray;

export interface JSONObject {
    [key: string]: JSONValue;
}

export interface JSONArray extends Array<JSONValue> { }

export interface EditorState {
    content: string;
    mode: EditorMode;
    isValid: boolean;
    error: string | null;
    parsed: JSONValue | null;
}

export interface ComparisonResult {
    added: string[];
    removed: string[];
    modified: string[];
}
