'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tab';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Copy, Send, Trash2, Plus, Clock, Save, X, 
  ChevronRight, ChevronLeft, FolderPlus 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import useAuth from '@/utils/useAuth';
import { ScrollArea } from '@/components/ui/scroll-area';
import { db } from '@/database/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
type AuthType = 'none' | 'bearer' | 'basic' | 'apiKey';
type BodyType = 'json' | 'text' | 'form-data' | 'x-www-form-urlencoded' | 'raw';

interface KeyValuePair {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
  description?: string;
}

interface SavedRequest {
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

interface RequestTab {
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
}

interface ApiResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  time: number;
}

interface Collection {
  id: string;
  name: string;
  requests: SavedRequest[];
}

const defaultHeaders: KeyValuePair[] = [
  { id: '1', key: 'Content-Type', value: 'application/json', enabled: true },
];

export default function ApiGridPage() {
  return (
    <div className="min-h-screen bg-background w-full flex flex-col">
      <ApiGrid />
    </div>
  );
}

function ApiGrid() {
  const { user } = useAuth(false);
  const [requestTabs, setRequestTabs] = useState<RequestTab[]>([
    {
      id: '1',
      name: 'Untitled Request',
      method: 'GET',
      url: 'https://api.github.com/users/octocat',
      headers: defaultHeaders,
      params: [],
      body: '',
      bodyType: 'json',
      authType: 'none',
      authData: {},
      isModified: false,
    },
  ]);
  const [activeTabId, setActiveTabId] = useState('1');
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [savedRequests, setSavedRequests] = useState<SavedRequest[]>([]);
  const [isLoadingCollections, setIsLoadingCollections] = useState(false);
  const [collectionsInitialized, setCollectionsInitialized] = useState(false);
  const [showCreateCollectionDialog, setShowCreateCollectionDialog] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [collectionNameError, setCollectionNameError] = useState('');
  const [showSaveRequestDialog, setShowSaveRequestDialog] = useState(false);
  const [saveCollectionId, setSaveCollectionId] = useState<string>('');
  const [saveCollectionName, setSaveCollectionName] = useState('');
  const [saveRequestName, setSaveRequestName] = useState('');
  const [saveRequestErrors, setSaveRequestErrors] = useState<{ collection?: string; request?: string }>({});
  const [showNewCollectionInput, setShowNewCollectionInput] = useState(false);
  const [deleteCollectionId, setDeleteCollectionId] = useState<string | null>(null);
  const [deleteRequestInfo, setDeleteRequestInfo] = useState<{ collectionId: string; requestId: string; requestName: string } | null>(null);
  const { toast } = useToast();

  const activeTab = requestTabs.find(t => t.id === activeTabId) || requestTabs[0];

  // Load collections from Firebase when user logs in
  useEffect(() => {
    const loadCollections = async () => {
      if (!user?.uid) {
        // Clear collections when user logs out
        setCollections([]);
        setSavedRequests([]);
        setCollectionsInitialized(false);
        return;
      }

      setIsLoadingCollections(true);
      try {
        const userCollectionsRef = doc(db, 'users', user.uid, 'apiGrid', 'collections');
        const collectionsDoc = await getDoc(userCollectionsRef);

        if (collectionsDoc.exists()) {
          const data = collectionsDoc.data();
          setCollections(data.collections || []);
          // Flatten all requests from collections for savedRequests
          const allRequests: SavedRequest[] = [];
          (data.collections || []).forEach((col: Collection) => {
            allRequests.push(...col.requests);
          });
          setSavedRequests(allRequests);
        } else {
          // Initialize empty collections document
          await setDoc(userCollectionsRef, { collections: [] });
          setCollections([]);
          setSavedRequests([]);
        }
        setCollectionsInitialized(true);
      } catch (error) {
        console.error('Error loading collections:', error);
        toast({
          title: 'Error',
          description: 'Failed to load collections',
          variant: 'destructive',
        });
        setCollectionsInitialized(true);
      } finally {
        setIsLoadingCollections(false);
      }
    };

    loadCollections();
  }, [user?.uid, toast]);

  // Save collections to Firebase whenever they change (for authenticated users)
  useEffect(() => {
    const saveCollections = async () => {
      if (!user?.uid || isLoadingCollections || !collectionsInitialized) {
        return;
      }

      try {
        const userCollectionsRef = doc(db, 'users', user.uid, 'apiGrid', 'collections');
        await setDoc(userCollectionsRef, { collections }, { merge: true });
      } catch (error) {
        console.error('Error saving collections:', error);
        toast({
          title: 'Error',
          description: 'Failed to save collections',
          variant: 'destructive',
        });
      }
    };

    saveCollections();
  }, [collections, user?.uid, isLoadingCollections, collectionsInitialized, toast]);

  // Collections helpers
  const findCollectionByName = (name: string): Collection | undefined => {
    return collections.find(c => c.name.toLowerCase() === name.trim().toLowerCase());
  };

  const createCollection = async (name: string): Promise<Collection | null> => {
    if (!user?.uid) {
      window.location.href = '/login';
      return null;
    }
    const trimmed = name.trim();
    if (!trimmed) {
      setCollectionNameError('Collection name cannot be empty');
      return null;
    }
    if (findCollectionByName(trimmed)) {
      setCollectionNameError('A collection with this name already exists');
      return null;
    }
    setCollectionNameError('');
    const newCollection: Collection = { id: Date.now().toString(), name: trimmed, requests: [] };
    setCollections(prev => [...prev, newCollection]);
    toast({ title: 'Collection created', description: `Created collection "${trimmed}"` });
    return newCollection;
  };

  const handleCreateCollection = async () => {
    const result = await createCollection(newCollectionName);
    if (result) {
      setShowCreateCollectionDialog(false);
      setNewCollectionName('');
      setCollectionNameError('');
    }
  };

  const ensureUniqueRequestName = (collection: Collection, requestName: string): boolean => {
    const exists = collection.requests.some(r => r.name.trim().toLowerCase() === requestName.trim().toLowerCase());
    return !exists;
  };

  const updateActiveTab = (updates: Partial<RequestTab>) => {
    setRequestTabs(tabs =>
      tabs.map(tab =>
        tab.id === activeTabId ? { ...tab, ...updates, isModified: true } : tab
      )
    );
  };

  const addNewTab = () => {
    const newTab: RequestTab = {
      id: Date.now().toString(),
      name: 'Untitled Request',
      method: 'GET',
      url: '',
      headers: defaultHeaders,
      params: [],
      body: '',
      bodyType: 'json',
      authType: 'none',
      authData: {},
      isModified: false,
    };
    setRequestTabs([...requestTabs, newTab]);
    setActiveTabId(newTab.id);
  };

  const closeTab = (tabId: string) => {
    if (requestTabs.length === 1) return;
    const newTabs = requestTabs.filter(t => t.id !== tabId);
    setRequestTabs(newTabs);
    if (activeTabId === tabId) {
      setActiveTabId(newTabs[0].id);
    }
  };

  const addKeyValue = (type: 'headers' | 'params') => {
    const newItem: KeyValuePair = {
      id: Date.now().toString(),
      key: '',
      value: '',
      enabled: true,
    };
    updateActiveTab({
      [type]: [...activeTab[type], newItem],
    });
  };

  const updateKeyValue = (type: 'headers' | 'params', id: string, field: keyof KeyValuePair, value: any) => {
    updateActiveTab({
      [type]: activeTab[type].map(item =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    });
  };

  const removeKeyValue = (type: 'headers' | 'params', id: string) => {
    updateActiveTab({
      [type]: activeTab[type].filter(item => item.id !== id),
    });
  };

  const buildUrl = () => {
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

  const buildHeaders = () => {
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

  const buildBody = () => {
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

  const handleSendRequest = async () => {
    if (!activeTab.url.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a URL',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setResponse(null);
    const startTime = Date.now();

    try {
      const url = buildUrl();
      const headers = buildHeaders();
      const body = buildBody();

      const options: RequestInit = {
        method: activeTab.method,
        headers,
      };

      if (body !== undefined) {
        options.body = body instanceof FormData ? body : body;
        if (typeof body === 'string' && activeTab.bodyType === 'json' && !headers['Content-Type']) {
          options.headers = { ...headers, 'Content-Type': 'application/json' };
        }
      }

      const res = await fetch(url, options);
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      let responseBody = '';
      const contentType = res.headers.get('content-type') || '';
      
      if (contentType.includes('application/json')) {
        try {
          const json = await res.json();
          responseBody = JSON.stringify(json, null, 2);
        } catch {
          responseBody = await res.text();
        }
      } else {
        responseBody = await res.text();
      }

      const responseHeaders: Record<string, string> = {};
      res.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      setResponse({
        status: res.status,
        statusText: res.statusText,
        headers: responseHeaders,
        body: responseBody,
        time: responseTime,
      });

      updateActiveTab({ isModified: false });
    } catch (error) {
      const endTime = Date.now();
      const errorMessage = error instanceof Error ? error.message : 'Request failed';
      
      setResponse({
        status: 0,
        statusText: 'Error',
        headers: {},
        body: `Error: ${errorMessage}`,
        time: endTime - startTime,
      });

      toast({
        title: 'Request Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveRequest = async () => {
    const errors: { collection?: string; request?: string } = {};
    
    let targetCollection: Collection | null = null;

    // Handle collection selection
    if (showNewCollectionInput) {
      // Creating new collection
      const trimmedCollectionName = saveCollectionName.trim();
      if (!trimmedCollectionName) {
        errors.collection = 'Collection name cannot be empty';
      } else {
        // Check if collection name already exists
        if (findCollectionByName(trimmedCollectionName)) {
          errors.collection = 'A collection with this name already exists';
        } else {
          const created = await createCollection(trimmedCollectionName);
          if (!created) {
            errors.collection = 'Failed to create collection';
          } else {
            targetCollection = created;
            setSaveCollectionId(created.id);
            setShowNewCollectionInput(false);
          }
        }
      }
    } else {
      // Using existing collection
      if (!saveCollectionId) {
        errors.collection = 'Please select a collection';
      } else {
        targetCollection = collections.find(c => c.id === saveCollectionId) || null;
        if (!targetCollection) {
          errors.collection = 'Selected collection not found';
        }
      }
    }

    const trimmedRequestName = saveRequestName.trim();
    if (!trimmedRequestName) {
      errors.request = 'Request name cannot be empty';
    }

    if (Object.keys(errors).length > 0) {
      setSaveRequestErrors(errors);
      return;
    }

    if (!targetCollection) {
      errors.collection = 'Collection is required';
      setSaveRequestErrors(errors);
      return;
    }

    // Enforce unique request name within the collection
    if (!ensureUniqueRequestName(targetCollection, trimmedRequestName)) {
      errors.request = 'A request with this name already exists in this collection';
      setSaveRequestErrors(errors);
      return;
    }

    setSaveRequestErrors({});

    const savedRequest: SavedRequest = {
      id: Date.now().toString(),
      name: trimmedRequestName,
      method: activeTab.method,
      url: activeTab.url,
      headers: activeTab.headers,
      params: activeTab.params,
      body: activeTab.body,
      bodyType: activeTab.bodyType,
      authType: activeTab.authType,
      authData: activeTab.authData,
      collectionId: targetCollection.id,
      timestamp: Date.now(),
    };
    
    // Persist in collections
    setCollections(prev => prev.map(c => c.id === targetCollection!.id ? { ...c, requests: [savedRequest, ...c.requests] } : c));

    // Optional flat list for quick access/search
    setSavedRequests([...savedRequests, savedRequest]);

    updateActiveTab({ name: savedRequest.name, isModified: false });
    setShowSaveRequestDialog(false);
    setSaveCollectionId('');
    setSaveCollectionName('');
    setSaveRequestName('');
    setShowNewCollectionInput(false);
    toast({ title: 'Request Saved', description: `Saved to ${targetCollection.name}` });
  };

  const openSaveRequestDialog = () => {
    if (!user?.uid) {
      window.location.href = '/login';
      return;
    }
    // Set default collection to first one if available
    if (collections.length > 0) {
      setSaveCollectionId(collections[0].id);
    } else {
      setSaveCollectionId('');
    }
    setSaveCollectionName('');
    setSaveRequestName(activeTab.name || 'Untitled Request');
    setSaveRequestErrors({});
    setShowNewCollectionInput(false);
    setShowSaveRequestDialog(true);
  };

  const loadRequest = (savedRequest: SavedRequest) => {
    const newTab: RequestTab = {
      id: Date.now().toString(),
      name: savedRequest.name,
      method: savedRequest.method,
      url: savedRequest.url,
      headers: savedRequest.headers,
      params: savedRequest.params,
      body: savedRequest.body,
      bodyType: savedRequest.bodyType,
      authType: savedRequest.authType,
      authData: savedRequest.authData,
      isModified: false,
    };
    setRequestTabs([...requestTabs, newTab]);
    setActiveTabId(newTab.id);
  };

  const handleDeleteCollection = (collectionId: string) => {
    setDeleteCollectionId(collectionId);
  };

  const confirmDeleteCollection = () => {
    if (!deleteCollectionId || !user?.uid) return;

    const collection = collections.find(c => c.id === deleteCollectionId);
    if (!collection) return;

    // Remove collection from state
    const updatedCollections = collections.filter(c => c.id !== deleteCollectionId);
    setCollections(updatedCollections);

    // Remove all requests from this collection from savedRequests
    const updatedSavedRequests = savedRequests.filter(req => req.collectionId !== deleteCollectionId);
    setSavedRequests(updatedSavedRequests);

    setDeleteCollectionId(null);
    toast({
      title: 'Collection Deleted',
      description: `Collection "${collection.name}" has been deleted`,
    });
  };

  const handleDeleteRequest = (collectionId: string, requestId: string, requestName: string) => {
    setDeleteRequestInfo({ collectionId, requestId, requestName });
  };

  const confirmDeleteRequest = () => {
    if (!deleteRequestInfo || !user?.uid) return;

    const { collectionId, requestId } = deleteRequestInfo;

    // Remove request from collection
    const updatedCollections = collections.map(collection => {
      if (collection.id === collectionId) {
        return {
          ...collection,
          requests: collection.requests.filter(req => req.id !== requestId),
        };
      }
      return collection;
    });
    setCollections(updatedCollections);

    // Remove from savedRequests
    const updatedSavedRequests = savedRequests.filter(req => req.id !== requestId);
    setSavedRequests(updatedSavedRequests);

    toast({
      title: 'Request Deleted',
      description: `Request "${deleteRequestInfo.requestName}" has been deleted`,
    });

    setDeleteRequestInfo(null);
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'bg-green-500/20 text-green-600 dark:text-green-400';
    if (status >= 300 && status < 400) return 'bg-blue-500/20 text-blue-600 dark:text-blue-400';
    if (status >= 400 && status < 500) return 'bg-orange-500/20 text-orange-600 dark:text-orange-400';
    if (status >= 500) return 'bg-red-500/20 text-red-600 dark:text-red-400';
    return 'bg-gray-500/20 text-gray-600 dark:text-gray-400';
  };

  // HTTP Method colors matching Swagger/OpenAPI style
  const getMethodColor = (method: HttpMethod) => {
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

  return (
    <div className="relative flex h-screen w-full overflow-hidden">
      {/* Sidebar */}
      {sidebarOpen && (
        <div className="w-64 border-r bg-muted/30 flex flex-col">
          <div className="p-4 border-b bg-background/50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-base">Collections</h2>
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)} className="h-8 w-8">
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
            <Input placeholder="Search..." className="mb-3 h-9" />
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => {
                if (!user?.uid) {
                  window.location.href = '/login';
                  return;
                }
                setNewCollectionName('');
                setCollectionNameError('');
                setShowCreateCollectionDialog(true);
              }}
            >
              <FolderPlus className="h-4 w-4 mr-2" />
              New Collection
            </Button>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-3">
              {isLoadingCollections ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Loading collections...
                </div>
              ) : (
                <>
                  {collections.map((col) => (
                <div key={col.id} className="border rounded-lg overflow-hidden bg-card shadow-sm">
                  <div className="px-3.5 py-2.5 bg-muted/40 text-sm font-semibold flex items-center justify-between group/collection border-b">
                    <span className="truncate text-foreground">{col.name}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs font-medium">
                        {col.requests.length}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover/collection:opacity-100 hover:text-destructive transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCollection(col.id);
                        }}
                        title="Delete collection"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="max-h-64 overflow-auto p-1.5">
                    {col.requests.length === 0 ? (
                      <div className="p-3 text-xs text-muted-foreground">Empty collection</div>
                    ) : (
                      col.requests.map((req) => (
                        <div
                          key={req.id}
                          className="p-2.5 hover:bg-muted/70 transition-colors rounded-md flex items-center gap-2.5 group/request cursor-pointer"
                          onClick={() => loadRequest(req)}
                        >
                          <Badge 
                            variant="outline" 
                            className={`font-mono text-[10px] font-semibold px-2 py-0.5 border ${getMethodColor(req.method)}`}
                          >
                            {req.method}
                          </Badge>
                          <span className="text-sm truncate flex-1 text-foreground/90 group-hover/request:text-foreground">
                            {req.name}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover/request:opacity-100 hover:text-destructive shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteRequest(col.id, req.id, req.name);
                            }}
                            title="Delete request"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                  ))}
                  {collections.length === 0 && !isLoadingCollections && (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      No collections yet. Create one to get started.
                    </div>
                  )}
                </>
              )}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Collapsed Sidebar Button - Always visible when sidebar is closed */}
      {!sidebarOpen && (
        <div className="fixed left-0 top-1/2 -translate-y-1/2 z-[100] animate-in slide-in-from-left">
          <Button
            variant="default"
            size="icon"
            className="h-14 w-10 rounded-l-none rounded-r-xl shadow-2xl border-2 border-primary bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 transition-transform"
            onClick={() => setSidebarOpen(true)}
            title="Show Collections"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
      )}

      {/* Alternative: Thin vertical bar when collapsed */}
      {!sidebarOpen && (
        <div 
          className="fixed left-0 top-0 bottom-0 w-1 bg-primary/30 hover:bg-primary z-40 cursor-pointer transition-colors"
          onClick={() => setSidebarOpen(true)}
          title="Click to show Collections"
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Request Tabs */}
        <div className="border-b bg-muted/30">
          <div className="flex items-center overflow-x-auto">
            {requestTabs.map((tab) => (
              <div
                key={tab.id}
                className={`group flex items-center gap-2.5 px-4 py-2.5 border-r cursor-pointer min-w-[200px] transition-colors ${
                  activeTabId === tab.id 
                    ? 'bg-background border-b-2 border-b-primary shadow-sm' 
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => setActiveTabId(tab.id)}
              >
                <Badge 
                  variant="outline" 
                  className={`font-mono text-xs font-semibold px-2 py-0.5 border ${getMethodColor(tab.method)}`}
                >
                  {tab.method}
                </Badge>
                <span className="text-sm truncate flex-1 font-medium">{tab.name}</span>
                {tab.isModified && <span className="w-1.5 h-1.5 bg-primary rounded-full shrink-0" />}
                {requestTabs.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      closeTab(tab.id);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
            <Button variant="ghost" size="sm" onClick={addNewTab} className="ml-2">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Request Builder */}
        <div className="flex-1 overflow-auto bg-background">
          <div className="max-w-7xl mx-auto p-6 space-y-6">
            {/* URL Bar */}
            <div className="flex gap-3 items-center">
              <Select value={activeTab.method} onValueChange={(value) => updateActiveTab({ method: value as HttpMethod })}>
                <SelectTrigger className={`w-36 font-mono font-semibold ${getMethodColor(activeTab.method)}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET" className="font-mono font-semibold">GET</SelectItem>
                  <SelectItem value="POST" className="font-mono font-semibold">POST</SelectItem>
                  <SelectItem value="PUT" className="font-mono font-semibold">PUT</SelectItem>
                  <SelectItem value="DELETE" className="font-mono font-semibold">DELETE</SelectItem>
                  <SelectItem value="PATCH" className="font-mono font-semibold">PATCH</SelectItem>
                  <SelectItem value="HEAD" className="font-mono font-semibold">HEAD</SelectItem>
                  <SelectItem value="OPTIONS" className="font-mono font-semibold">OPTIONS</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="https://api.example.com/endpoint"
                value={activeTab.url}
                onChange={(e) => updateActiveTab({ url: e.target.value })}
                className="font-mono flex-1 h-10"
              />
              <Button 
                onClick={handleSendRequest} 
                disabled={isLoading || !activeTab.url.trim()}
                className="h-10"
              >
                <Send className="h-4 w-4 mr-2" />
                Send
              </Button>
              <Button 
                variant="outline" 
                onClick={openSaveRequestDialog}
                className="h-10"
              >
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>

            {/* Request Tabs */}
            <Tabs defaultValue="params" className="w-full">
              <TabsList className="h-11">
                <TabsTrigger value="params" className="text-sm font-medium">
                  Params
                  {activeTab.params.filter(p => p.enabled).length > 0 && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {activeTab.params.filter(p => p.enabled).length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="body" className="text-sm font-medium">
                  Body
                </TabsTrigger>
                <TabsTrigger value="headers" className="text-sm font-medium">
                  Headers
                  {activeTab.headers.filter(h => h.enabled).length > 0 && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {activeTab.headers.filter(h => h.enabled).length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="auth" className="text-sm font-medium">Authorization</TabsTrigger>
              </TabsList>

              <TabsContent value="params" className="mt-4">
                <div className="border rounded-lg overflow-hidden shadow-sm">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox checked={activeTab.params.every(p => !p.enabled || p.key.trim() === '')} />
                        </TableHead>
                        <TableHead>Key</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeTab.params.map((param) => (
                        <TableRow key={param.id}>
                          <TableCell>
                            <Checkbox
                              checked={param.enabled}
                              onCheckedChange={(checked) =>
                                updateKeyValue('params', param.id, 'enabled', checked)
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              placeholder="key"
                              value={param.key}
                              onChange={(e) => updateKeyValue('params', param.id, 'key', e.target.value)}
                              className="font-mono border-0 h-8"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              placeholder="value"
                              value={param.value}
                              onChange={(e) => updateKeyValue('params', param.id, 'value', e.target.value)}
                              className="font-mono border-0 h-8"
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => removeKeyValue('params', param.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="p-2 border-t">
                    <Button variant="ghost" size="sm" onClick={() => addKeyValue('params')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="body" className="mt-4">
                {['POST', 'PUT', 'PATCH'].includes(activeTab.method) ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Body Type</Label>
                      <Tabs value={activeTab.bodyType} onValueChange={(value) => updateActiveTab({ bodyType: value as BodyType })}>
                        <TabsList>
                          <TabsTrigger value="json">JSON</TabsTrigger>
                          <TabsTrigger value="text">Text</TabsTrigger>
                          <TabsTrigger value="form-data">Form Data</TabsTrigger>
                          <TabsTrigger value="x-www-form-urlencoded">URL Encoded</TabsTrigger>
                          <TabsTrigger value="raw">Raw</TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>
                    <Textarea
                      placeholder={
                        activeTab.bodyType === 'json'
                          ? '{\n  "key": "value"\n}'
                          : activeTab.bodyType === 'form-data' || activeTab.bodyType === 'x-www-form-urlencoded'
                          ? 'key=value'
                          : 'Enter body content...'
                      }
                      value={activeTab.body}
                      onChange={(e) => updateActiveTab({ body: e.target.value })}
                      className="font-mono min-h-[300px] text-sm"
                    />
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-12">
                    This request method doesn't support a body
                  </div>
                )}
              </TabsContent>

              <TabsContent value="headers" className="mt-4">
                <div className="border rounded-lg overflow-hidden shadow-sm">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox checked={activeTab.headers.every(h => !h.enabled || h.key.trim() === '')} />
                        </TableHead>
                        <TableHead>Header Name</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeTab.headers.map((header) => (
                        <TableRow key={header.id}>
                          <TableCell>
                            <Checkbox
                              checked={header.enabled}
                              onCheckedChange={(checked) =>
                                updateKeyValue('headers', header.id, 'enabled', checked)
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              placeholder="Header name"
                              value={header.key}
                              onChange={(e) => updateKeyValue('headers', header.id, 'key', e.target.value)}
                              className="font-mono border-0 h-8"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              placeholder="Header value"
                              value={header.value}
                              onChange={(e) => updateKeyValue('headers', header.id, 'value', e.target.value)}
                              className="font-mono border-0 h-8"
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => removeKeyValue('headers', header.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="p-2 border-t">
                    <Button variant="ghost" size="sm" onClick={() => addKeyValue('headers')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="auth" className="mt-4">
                <div className="space-y-4">
                  <div>
                    <Label>Type</Label>
                    <Select
                      value={activeTab.authType}
                      onValueChange={(value) => updateActiveTab({ authType: value as AuthType })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Auth</SelectItem>
                        <SelectItem value="bearer">Bearer Token</SelectItem>
                        <SelectItem value="basic">Basic Auth</SelectItem>
                        <SelectItem value="apiKey">API Key</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {activeTab.authType === 'bearer' && (
                    <div>
                      <Label>Token</Label>
                      <Input
                        placeholder="Enter bearer token"
                        value={activeTab.authData.token || ''}
                        onChange={(e) =>
                          updateActiveTab({
                            authData: { ...activeTab.authData, token: e.target.value },
                          })
                        }
                        className="font-mono"
                      />
                    </div>
                  )}

                  {activeTab.authType === 'basic' && (
                    <div className="space-y-2">
                      <div>
                        <Label>Username</Label>
                        <Input
                          placeholder="Username"
                          value={activeTab.authData.username || ''}
                          onChange={(e) =>
                            updateActiveTab({
                              authData: { ...activeTab.authData, username: e.target.value },
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label>Password</Label>
                        <Input
                          type="password"
                          placeholder="Password"
                          value={activeTab.authData.password || ''}
                          onChange={(e) =>
                            updateActiveTab({
                              authData: { ...activeTab.authData, password: e.target.value },
                            })
                          }
                        />
                      </div>
                    </div>
                  )}

                  {activeTab.authType === 'apiKey' && (
                    <div className="space-y-2">
                      <div>
                        <Label>Key</Label>
                        <Input
                          placeholder="API Key name"
                          value={activeTab.authData.key || ''}
                          onChange={(e) =>
                            updateActiveTab({
                              authData: { ...activeTab.authData, key: e.target.value },
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label>Value</Label>
                        <Input
                          placeholder="API Key value"
                          value={activeTab.authData.value || ''}
                          onChange={(e) =>
                            updateActiveTab({
                              authData: { ...activeTab.authData, value: e.target.value },
                            })
                          }
                          className="font-mono"
                        />
                      </div>
                      <div>
                        <Label>Add to</Label>
                        <Select
                          value={activeTab.authData.addTo || 'header'}
                          onValueChange={(value: 'header' | 'query') =>
                            updateActiveTab({
                              authData: { ...activeTab.authData, addTo: value },
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="header">Header</SelectItem>
                            <SelectItem value="query">Query Params</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            {/* Response Section */}
            {response && (
              <div className="space-y-4 border-t pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Label className="text-lg font-semibold">Response</Label>
                    <Badge className={getStatusColor(response.status)}>
                      {response.status} {response.statusText}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {response.time}ms
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(response.body);
                      toast({
                        title: 'Copied',
                        description: 'Response copied to clipboard',
                      });
                    }}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>

                <Tabs defaultValue="body">
                  <TabsList>
                    <TabsTrigger value="body">Body</TabsTrigger>
                    <TabsTrigger value="headers">Headers</TabsTrigger>
                  </TabsList>
                  <TabsContent value="body" className="mt-4">
                    <div className="border rounded-lg p-4 bg-muted/30 min-h-[300px] max-h-[600px] overflow-auto">
                      {response.status === 0 ? (
                        <div className="text-red-500 font-mono text-sm">{response.body}</div>
                      ) : (
                        <pre className="font-mono text-sm whitespace-pre-wrap break-words">
                          {response.body}
                        </pre>
                      )}
                    </div>
                  </TabsContent>
                  <TabsContent value="headers" className="mt-4">
                    <div className="border rounded-lg p-4 bg-muted/30 min-h-[300px] max-h-[600px] overflow-auto">
                      <pre className="font-mono text-sm whitespace-pre-wrap break-words">
                        {Object.entries(response.headers)
                          .map(([key, value]) => `${key}: ${value}`)
                          .join('\n')}
                      </pre>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Collection Dialog */}
      <Dialog open={showCreateCollectionDialog} onOpenChange={setShowCreateCollectionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Collection</DialogTitle>
            <DialogDescription>
              Enter a name for your new collection. The name must be unique.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="collection-name">Collection Name</Label>
              <Input
                id="collection-name"
                placeholder="My Collection"
                value={newCollectionName}
                onChange={(e) => {
                  setNewCollectionName(e.target.value);
                  setCollectionNameError('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateCollection();
                  }
                }}
              />
              {collectionNameError && (
                <p className="text-sm text-destructive">{collectionNameError}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateCollectionDialog(false);
                setNewCollectionName('');
                setCollectionNameError('');
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateCollection}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Save Request Dialog */}
      <Dialog open={showSaveRequestDialog} onOpenChange={setShowSaveRequestDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Request</DialogTitle>
            <DialogDescription>
              Save this request to a collection. The collection will be created if it doesn't exist.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="save-collection-select">Collection</Label>
              {!showNewCollectionInput ? (
                <>
                  <div className="flex gap-2">
                    <Select
                      value={saveCollectionId}
                      onValueChange={(value) => {
                        setSaveCollectionId(value);
                        setSaveRequestErrors({ ...saveRequestErrors, collection: undefined });
                      }}
                    >
                      <SelectTrigger id="save-collection-select" className="flex-1">
                        <SelectValue placeholder="Select a collection" />
                      </SelectTrigger>
                      <SelectContent>
                        {collections.map((col) => (
                          <SelectItem key={col.id} value={col.id}>
                            {col.name} ({col.requests.length} requests)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowNewCollectionInput(true);
                        setSaveCollectionId('');
                        setSaveCollectionName('');
                        setSaveRequestErrors({ ...saveRequestErrors, collection: undefined });
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {collections.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      No collections yet. Click the + button to create one.
                    </p>
                  )}
                </>
              ) : (
                <>
                  <div className="flex gap-2">
                    <Input
                      id="save-collection-name"
                      placeholder="New collection name"
                      value={saveCollectionName}
                      onChange={(e) => {
                        setSaveCollectionName(e.target.value);
                        setSaveRequestErrors({ ...saveRequestErrors, collection: undefined });
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowNewCollectionInput(false);
                        setSaveCollectionName('');
                        if (collections.length > 0) {
                          setSaveCollectionId(collections[0].id);
                        }
                        setSaveRequestErrors({ ...saveRequestErrors, collection: undefined });
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              )}
              {saveRequestErrors.collection && (
                <p className="text-sm text-destructive">{saveRequestErrors.collection}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="save-request-name">Request Name</Label>
              <Input
                id="save-request-name"
                placeholder="Untitled Request"
                value={saveRequestName}
                onChange={(e) => {
                  setSaveRequestName(e.target.value);
                  setSaveRequestErrors({ ...saveRequestErrors, request: undefined });
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey) {
                    handleSaveRequest();
                  }
                }}
              />
              {saveRequestErrors.request && (
                <p className="text-sm text-destructive">{saveRequestErrors.request}</p>
              )}
              <p className="text-xs text-muted-foreground">
                The request name must be unique within the selected collection.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowSaveRequestDialog(false);
                setSaveCollectionId('');
                setSaveCollectionName('');
                setSaveRequestName('');
                setSaveRequestErrors({});
                setShowNewCollectionInput(false);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveRequest}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Collection Confirmation Dialog */}
      <AlertDialog open={deleteCollectionId !== null} onOpenChange={(open) => !open && setDeleteCollectionId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Collection</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the collection "{collections.find(c => c.id === deleteCollectionId)?.name}"? 
              This will permanently delete the collection and all {collections.find(c => c.id === deleteCollectionId)?.requests.length || 0} request(s) in it. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteCollection}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Request Confirmation Dialog */}
      <AlertDialog open={deleteRequestInfo !== null} onOpenChange={(open) => !open && setDeleteRequestInfo(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Request</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the request "{deleteRequestInfo?.requestName}"? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteRequest}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
