'use client';

import React, { useState, useEffect } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  useDraggable,
  useDroppable,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
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
  ChevronRight, ChevronLeft, ChevronDown, FolderPlus, Folder, Search,
  Loader2, CheckCircle2, AlertCircle, Pencil,
  Globe, Radio, Code, Settings, MoreHorizontal,
  FilePlus, Play, Download
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuShortcut,
} from '@/components/ui/dropdown-menu';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
type AuthType = 'none' | 'bearer' | 'basic' | 'apiKey';
type BodyType = 'json' | 'text' | 'form-data' | 'x-www-form-urlencoded' | 'raw';
type ProtocolType = 'REST' | 'WebSocket' | 'GraphQL';

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
  savedRequestId?: string; // Track which saved request this tab is based on
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
  collections?: Collection[];
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
  const [parentCollectionId, setParentCollectionId] = useState<string | undefined>(undefined);
  const [showSaveRequestDialog, setShowSaveRequestDialog] = useState(false);
  const [saveCollectionId, setSaveCollectionId] = useState<string>('');
  const [saveCollectionName, setSaveCollectionName] = useState('');
  const [saveRequestName, setSaveRequestName] = useState('');
  const [saveRequestErrors, setSaveRequestErrors] = useState<{ collection?: string; request?: string }>({});
  const [showNewCollectionInput, setShowNewCollectionInput] = useState(false);
  const [deleteCollectionId, setDeleteCollectionId] = useState<string | null>(null);
  const [deleteRequestInfo, setDeleteRequestInfo] = useState<{ collectionId: string; requestId: string; requestName: string } | null>(null);
  const [editCollectionId, setEditCollectionId] = useState<string | null>(null);
  const [editCollectionName, setEditCollectionName] = useState('');
  const [editCollectionNameError, setEditCollectionNameError] = useState('');
  const [editRequestInfo, setEditRequestInfo] = useState<{ collectionId: string; requestId: string; requestName: string } | null>(null);
  const [editRequestName, setEditRequestName] = useState('');
  const [editRequestNameError, setEditRequestNameError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [protocol, setProtocol] = useState<ProtocolType>('REST');
  const [expandedCollections, setExpandedCollections] = useState<Set<string>>(new Set());
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const { toast } = useToast();

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

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
          // Flatten all requests from collections (including nested) for savedRequests
          const collectAllRequests = (cols: Collection[]): SavedRequest[] => {
            const allRequests: SavedRequest[] = [];
            cols.forEach((col: Collection) => {
              allRequests.push(...col.requests);
              if (col.collections) {
                allRequests.push(...collectAllRequests(col.collections));
              }
            });
            return allRequests;
          };
          const allRequests = collectAllRequests(data.collections || []);
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
  const findCollectionById = (id: string, collectionsList: Collection[] = collections): Collection | undefined => {
    for (const col of collectionsList) {
      if (col.id === id) return col;
      if (col.collections) {
        const found = findCollectionById(id, col.collections);
        if (found) return found;
      }
    }
    return undefined;
  };

  const findCollectionByName = (name: string, collectionsList: Collection[] = collections): Collection | undefined => {
    for (const col of collectionsList) {
      if (col.name.toLowerCase() === name.trim().toLowerCase()) return col;
      if (col.collections) {
        const found = findCollectionByName(name, col.collections);
        if (found) return found;
      }
    }
    return undefined;
  };

  const findCollectionByNameInParent = (name: string, parentCollection: Collection): Collection | undefined => {
    if (!parentCollection.collections) return undefined;
    return parentCollection.collections.find(c => c.name.toLowerCase() === name.trim().toLowerCase());
  };

  const createCollection = async (name: string, parentCollectionId?: string): Promise<Collection | null> => {
    if (!user?.uid) {
      window.location.href = '/login';
      return null;
    }
    const trimmed = name.trim();
    if (!trimmed) {
      setCollectionNameError('Collection name cannot be empty');
      return null;
    }

    const newCollection: Collection = { id: Date.now().toString(), name: trimmed, requests: [], collections: [] };

    if (parentCollectionId) {
      // Create nested collection
      const parentCollection = findCollectionById(parentCollectionId);
      if (!parentCollection) {
        setCollectionNameError('Parent collection not found');
        return null;
      }

      // Check if name already exists in parent
      if (findCollectionByNameInParent(trimmed, parentCollection)) {
        setCollectionNameError('A collection with this name already exists in this folder');
        return null;
      }

      // Add to parent's collections
      setCollections(prev => {
        const updateCollection = (col: Collection): Collection => {
          if (col.id === parentCollectionId) {
            return {
              ...col,
              collections: [...(col.collections || []), newCollection],
            };
          }
          if (col.collections) {
            return {
              ...col,
              collections: col.collections.map(updateCollection),
            };
          }
          return col;
        };
        return prev.map(updateCollection);
      });

      toast({ title: 'Folder created', description: `Created folder "${trimmed}" in "${parentCollection.name}"` });
      return newCollection;
    } else {
      // Create root-level collection
      if (findCollectionByName(trimmed)) {
        setCollectionNameError('A collection with this name already exists');
        return null;
      }
      setCollectionNameError('');
      setCollections(prev => [...prev, newCollection]);
      toast({ title: 'Collection created', description: `Created collection "${trimmed}"` });
      return newCollection;
    }
  };

  const handleCreateCollection = async () => {
    const result = await createCollection(newCollectionName, parentCollectionId);
    if (result) {
      setShowCreateCollectionDialog(false);
      setNewCollectionName('');
      setCollectionNameError('');
      setParentCollectionId(undefined);
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

  const handleNewRequestInCollection = (collectionId: string) => {
    // Create a new empty tab
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
    
    // Auto-set the collection in save dialog for later
    setSaveCollectionId(collectionId);
    
    // Optionally auto-open the save dialog
    // setShowSaveRequestDialog(true);
  };

  const handleDuplicateCollection = (collectionId: string) => {
    const collection = collections.find(c => c.id === collectionId);
    if (!collection) return;

    const duplicated: Collection = {
      id: Date.now().toString(),
      name: `${collection.name} (Copy)`,
      requests: collection.requests.map(req => ({
        ...req,
        id: Date.now().toString() + Math.random(),
        timestamp: Date.now(),
      })),
    };
    setCollections(prev => [...prev, duplicated]);
    toast({
      title: 'Collection Duplicated',
      description: `Duplicated "${collection.name}"`,
    });
  };

  const handleExportCollection = (collectionId: string) => {
    const collection = collections.find(c => c.id === collectionId);
    if (!collection) return;

    const exportData = JSON.stringify(collection, null, 2);
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${collection.name.replace(/[^a-z0-9]/gi, '_')}_collection.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Collection Exported',
      description: `Exported "${collection.name}"`,
    });
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
        targetCollection = findCollectionById(saveCollectionId) || null;
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
    
    // Persist in collections (recursively)
    const addRequestToCollection = (cols: Collection[]): Collection[] => {
      return cols.map(collection => {
        if (collection.id === targetCollection!.id) {
          return {
            ...collection,
            requests: [savedRequest, ...collection.requests],
          };
        }
        if (collection.collections) {
          return {
            ...collection,
            collections: addRequestToCollection(collection.collections),
          };
        }
        return collection;
      });
    };
    setCollections(prev => addRequestToCollection(prev));

    // Optional flat list for quick access/search
    setSavedRequests([...savedRequests, savedRequest]);

    // Update active tab with saved request info
    updateActiveTab({ name: savedRequest.name, isModified: false });
    // Set savedRequestId on the active tab
    setRequestTabs(tabs =>
      tabs.map(tab =>
        tab.id === activeTabId ? { ...tab, savedRequestId: savedRequest.id } : tab
      )
    );
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

  const loadRequest = (savedRequest: SavedRequest, duplicate: boolean = false) => {
    // Check if this request is already open in a tab (unless duplicating)
    if (!duplicate) {
      const existingTab = requestTabs.find(tab => tab.savedRequestId === savedRequest.id);
      if (existingTab) {
        // Switch to the existing tab
        setActiveTabId(existingTab.id);
        return;
      }
    }

    // Create a new tab
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
      savedRequestId: savedRequest.id,
    };
    setRequestTabs([...requestTabs, newTab]);
    setActiveTabId(newTab.id);
  };

  const handleDeleteCollection = (collectionId: string) => {
    setDeleteCollectionId(collectionId);
  };

  const confirmDeleteCollection = () => {
    if (!deleteCollectionId || !user?.uid) return;

    const collection = findCollectionById(deleteCollectionId);
    if (!collection) return;

    // Helper to collect all request IDs from a collection and its nested collections
    const collectRequestIds = (col: Collection): string[] => {
      const ids = col.requests.map(r => r.id);
      if (col.collections) {
        col.collections.forEach(nested => {
          ids.push(...collectRequestIds(nested));
        });
      }
      return ids;
    };

    // Remove collection recursively
    const removeCollection = (cols: Collection[]): Collection[] => {
      return cols
        .filter(c => c.id !== deleteCollectionId)
        .map(col => ({
          ...col,
          collections: col.collections ? removeCollection(col.collections) : undefined,
        }));
    };

    const requestIdsToRemove = collectRequestIds(collection);
    const updatedCollections = removeCollection(collections);
    setCollections(updatedCollections);

    // Remove all requests from this collection and nested collections from savedRequests
    const updatedSavedRequests = savedRequests.filter(req => !requestIdsToRemove.includes(req.id));
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

    // Remove request from collection recursively
    const removeRequest = (cols: Collection[]): Collection[] => {
      return cols.map(collection => {
        if (collection.id === collectionId) {
          return {
            ...collection,
            requests: collection.requests.filter(req => req.id !== requestId),
          };
        }
        if (collection.collections) {
          return {
            ...collection,
            collections: removeRequest(collection.collections),
          };
        }
        return collection;
      });
    };

    const updatedCollections = removeRequest(collections);
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

  // Edit collection name
  const handleEditCollection = (collectionId: string) => {
    const collection = findCollectionById(collectionId);
    if (!collection) return;
    setEditCollectionId(collectionId);
    setEditCollectionName(collection.name);
    setEditCollectionNameError('');
  };

  const confirmEditCollection = () => {
    if (!editCollectionId || !user?.uid) return;

    const trimmedName = editCollectionName.trim();
    if (!trimmedName) {
      setEditCollectionNameError('Collection name cannot be empty');
      return;
    }

    // Find the parent collection to check for name conflicts within the same parent
    const collection = findCollectionById(editCollectionId);
    if (!collection) return;

    // Check if name already exists in the same parent (excluding current collection)
    // For now, we'll check globally - could be improved to check within parent only
    const nameExists = findCollectionByName(trimmedName);
    if (nameExists && nameExists.id !== editCollectionId) {
      setEditCollectionNameError('A collection with this name already exists');
      return;
    }

    // Update collection name recursively
    const updateCollectionName = (cols: Collection[]): Collection[] => {
      return cols.map(col => {
        if (col.id === editCollectionId) {
          return {
            ...col,
            name: trimmedName,
          };
        }
        if (col.collections) {
          return {
            ...col,
            collections: updateCollectionName(col.collections),
          };
        }
        return col;
      });
    };

    const updatedCollections = updateCollectionName(collections);
    setCollections(updatedCollections);

    toast({
      title: 'Collection Updated',
      description: `Collection renamed to "${trimmedName}"`,
    });

    setEditCollectionId(null);
    setEditCollectionName('');
    setEditCollectionNameError('');
  };

  // Edit request name
  const handleEditRequest = (collectionId: string, requestId: string) => {
    const collection = findCollectionById(collectionId);
    if (!collection) return;
    const request = collection.requests.find(r => r.id === requestId);
    if (!request) return;
    setEditRequestInfo({ collectionId, requestId, requestName: request.name });
    setEditRequestName(request.name);
    setEditRequestNameError('');
  };

  const confirmEditRequest = () => {
    if (!editRequestInfo || !user?.uid) return;

    const { collectionId, requestId } = editRequestInfo;
    const trimmedName = editRequestName.trim();
    
    if (!trimmedName) {
      setEditRequestNameError('Request name cannot be empty');
      return;
    }

    // Check if name already exists in the same collection (excluding current request)
    const collection = findCollectionById(collectionId);
    if (collection) {
      const nameExists = collection.requests.some(
        r => r.id !== requestId && r.name.toLowerCase() === trimmedName.toLowerCase()
      );

      if (nameExists) {
        setEditRequestNameError('A request with this name already exists in this collection');
        return;
      }
    }

    // Update request name in collection recursively
    const updateRequestName = (cols: Collection[]): Collection[] => {
      return cols.map(collection => {
        if (collection.id === collectionId) {
          return {
            ...collection,
            requests: collection.requests.map(req =>
              req.id === requestId ? { ...req, name: trimmedName } : req
            ),
          };
        }
        if (collection.collections) {
          return {
            ...collection,
            collections: updateRequestName(collection.collections),
          };
        }
        return collection;
      });
    };

    const updatedCollections = updateRequestName(collections);
    setCollections(updatedCollections);

    // Update in savedRequests
    const updatedSavedRequests = savedRequests.map(req =>
      req.id === requestId ? { ...req, name: trimmedName } : req
    );
    setSavedRequests(updatedSavedRequests);

    // Update in active tabs if this request is currently loaded
    setRequestTabs(tabs =>
      tabs.map(tab => {
        const savedReq = savedRequests.find(r => r.id === requestId);
        if (savedReq && tab.name === savedReq.name) {
          return { ...tab, name: trimmedName };
        }
        return tab;
      })
    );

    toast({
      title: 'Request Updated',
      description: `Request renamed to "${trimmedName}"`,
    });

    setEditRequestInfo(null);
    setEditRequestName('');
    setEditRequestNameError('');
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

  // Toggle collection expansion
  const toggleCollection = (collectionId: string) => {
    setExpandedCollections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(collectionId)) {
        newSet.delete(collectionId);
      } else {
        newSet.add(collectionId);
      }
      return newSet;
    });
  };

  // Filter collections and requests based on search (recursive)
  const filterCollection = (col: Collection): Collection | null => {
    const filteredRequests = col.requests.filter(req => 
      req.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.method.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    const filteredNested = col.collections
      ? col.collections.map(filterCollection).filter((c): c is Collection => c !== null)
      : [];
    
    const nameMatches = col.name.toLowerCase().includes(searchQuery.toLowerCase());
    const hasMatchingRequests = filteredRequests.length > 0;
    const hasMatchingNested = filteredNested.length > 0;
    
    if (nameMatches || hasMatchingRequests || hasMatchingNested) {
      return {
        ...col,
        requests: filteredRequests,
        collections: filteredNested.length > 0 ? filteredNested : col.collections,
      };
    }
    
    return null;
  };

  const filteredCollections = collections
    .map(filterCollection)
    .filter((col): col is Collection => col !== null);

  // Parse cURL command
  const parseCurlCommand = (curlString: string): Partial<RequestTab> | null => {
    // Normalize: remove newlines, collapse whitespace, handle escaped quotes
    const normalized = curlString
      .replace(/\\\n/g, ' ') // Remove line continuation
      .replace(/\n/g, ' ') // Replace newlines with spaces
      .replace(/\s+/g, ' ') // Collapse multiple spaces
      .trim();

    // Check if it looks like a cURL command
    const isCurl = normalized.toLowerCase().startsWith('curl') || 
                   normalized.includes(' -X ') || 
                   normalized.includes(' --request ') ||
                   normalized.includes(' -H ') || 
                   normalized.includes(' --header ') ||
                   normalized.includes(' -d ') ||
                   normalized.includes(' --data');

    if (!isCurl) {
      return null;
    }

    try {
      // Remove 'curl' prefix
      let cleaned = normalized.replace(/^curl\s*/i, '').trim();
      
      let method: HttpMethod = 'GET';
      let url = '';
      const headers: KeyValuePair[] = [];
      let body = '';
      let bodyType: BodyType = 'json';
      let authType: AuthType = 'none';
      const authData: SavedRequest['authData'] = {};

      // Extract method (-X or --request)
      const methodMatch = cleaned.match(/-X\s+(\w+)|--request\s+(\w+)/i);
      if (methodMatch) {
        const m = (methodMatch[1] || methodMatch[2]).toUpperCase() as HttpMethod;
        if (['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'].includes(m)) {
          method = m;
        }
      }

      // Extract headers (-H or --header) - handle both single and double quotes, and unquoted
      const headerPatterns = [
        /-H\s+['"]([^'"]+)['"]/gi,
        /--header\s+['"]([^'"]+)['"]/gi,
        /-H\s+([^\s]+:[^\s]+)/gi,
        /--header\s+([^\s]+:[^\s]+)/gi,
      ];

      for (const pattern of headerPatterns) {
        let headerMatch;
        while ((headerMatch = pattern.exec(cleaned)) !== null) {
          const headerValue = headerMatch[1].trim();
          const colonIndex = headerValue.indexOf(':');
          if (colonIndex > 0) {
            const key = headerValue.substring(0, colonIndex).trim();
            const value = headerValue.substring(colonIndex + 1).trim().replace(/^['"]|['"]$/g, '');
            
            // Skip if already added
            if (headers.some(h => h.key.toLowerCase() === key.toLowerCase())) {
              continue;
            }

            headers.push({
              id: Date.now().toString() + Math.random(),
              key: key,
              value: value,
              enabled: true,
            });

            // Check for Authorization header to set auth
            if (key.toLowerCase() === 'authorization') {
              if (value.startsWith('Bearer ')) {
                authType = 'bearer';
                authData.token = value.replace(/^Bearer\s+/i, '');
              } else if (value.startsWith('Basic ')) {
                authType = 'basic';
                try {
                  const decoded = atob(value.replace(/^Basic\s+/i, ''));
                  const [username, password] = decoded.split(':');
                  authData.username = username || '';
                  authData.password = password || '';
                } catch (e) {
                  // If decoding fails, just store the token
                }
              }
            }
          }
        }
      }

      // Extract body data (-d, --data, --data-raw, --data-binary)
      // Handle quoted and unquoted data
      const bodyMatches = [
        cleaned.match(/--data-raw\s+(['"])(.*?)\1/i),
        cleaned.match(/--data-binary\s+(['"])(.*?)\1/i),
        cleaned.match(/--data\s+(['"])(.*?)\1/i),
        cleaned.match(/-d\s+(['"])(.*?)\1/i),
        cleaned.match(/--data-raw\s+([^\s]+)/i),
        cleaned.match(/--data-binary\s+([^\s]+)/i),
        cleaned.match(/--data\s+([^\s]+)/i),
        cleaned.match(/-d\s+([^\s]+)/i),
      ].filter(match => match !== null);

      if (bodyMatches.length > 0) {
        const bodyMatch = bodyMatches[0];
        if (bodyMatch) {
          body = bodyMatch[2] || bodyMatch[1] || '';
          // Remove surrounding quotes if present
          body = body.replace(/^['"]|['"]$/g, '');
          
          // Check Content-Type to determine body type
          const contentTypeHeader = headers.find(h => h.key.toLowerCase() === 'content-type');
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
          } else {
            // Try to detect JSON
            try {
              const trimmedBody = body.trim();
              if (trimmedBody.startsWith('{') || trimmedBody.startsWith('[')) {
                JSON.parse(trimmedBody);
                bodyType = 'json';
              } else {
                bodyType = 'text';
              }
            } catch {
              bodyType = 'text';
            }
          }

          // Update method to POST if body is present and method is still GET
          if (method === 'GET' && body) {
            method = 'POST';
          }
        }
      }

      // Extract URL - find URLs that aren't part of headers or data
      // Look for http:// or https:// patterns
      const urlPatterns = [
        /https?:\/\/[^\s'"]+/gi,
        /['"]?(https?:\/\/[^'"]+)['"]?/gi,
      ];

      for (const pattern of urlPatterns) {
        const urlMatches = cleaned.matchAll(pattern);
        for (const match of urlMatches) {
          const potentialUrl = match[0].replace(/^['"]|['"]$/g, '');
          // Skip if it's in a header or data field
          const beforeMatch = cleaned.substring(0, match.index || 0);
          if (!beforeMatch.includes('-H') && 
              !beforeMatch.includes('--header') && 
              !beforeMatch.includes('-d') && 
              !beforeMatch.includes('--data')) {
            url = potentialUrl;
            break;
          }
        }
        if (url) break;
      }

      // If still no URL, try to find any URL-like string
      if (!url) {
        const fallbackUrl = cleaned.match(/['"]?(https?:\/\/[^\s'"]+)['"]?/i);
        if (fallbackUrl) {
          url = fallbackUrl[1] || fallbackUrl[0];
        }
      }

      // If no headers were parsed, keep default headers
      const finalHeaders = headers.length > 0 ? headers : defaultHeaders;

      // Only return if we have at least a URL
      if (!url) {
        return null;
      }

      return {
        method,
        url,
        headers: finalHeaders,
        body,
        bodyType,
        authType,
        authData,
      };
    } catch (error) {
      console.error('Error parsing cURL:', error);
      return null;
    }
  };

  // Handle paste in URL field
  const handleUrlPaste = async (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData('text');
    const parsed = parseCurlCommand(pastedText);
    
    if (parsed) {
      e.preventDefault();
      
      // Update the active tab with parsed data
      updateActiveTab({
        ...parsed,
        isModified: true,
      });

      toast({
        title: 'cURL Parsed',
        description: 'Request has been populated from cURL command',
      });
    }
  };

  // Helper function to render collection options recursively for select dropdown
  const renderCollectionOptions = (cols: Collection[], depth: number = 0) => {
    const options: React.ReactElement[] = [];
    
    cols.forEach((col) => {
      const indent = '  '.repeat(depth);
      
      options.push(
        <SelectItem key={col.id} value={col.id}>
          <span className="flex items-center gap-2">
            <span className="text-muted-foreground font-mono text-xs">{indent}</span>
            <Folder className="h-3 w-3 text-muted-foreground shrink-0" />
            <span>{col.name}</span>
            <span className="text-muted-foreground text-xs">
              ({col.requests.length} {col.requests.length === 1 ? 'request' : 'requests'})
            </span>
          </span>
        </SelectItem>
      );
      
      // Recursively render nested collections
      if (col.collections && col.collections.length > 0) {
        options.push(...renderCollectionOptions(col.collections, depth + 1));
      }
    });
    
    return options;
  };

  // Move request from one collection to another
  const moveRequestToCollection = (requestId: string, targetCollectionId: string, sourceCollectionId: string) => {
    if (targetCollectionId === sourceCollectionId) return;

    const request = savedRequests.find(r => r.id === requestId);
    if (!request) return;

    // Remove from source collection
    const removeFromSource = (cols: Collection[]): Collection[] => {
      return cols.map(collection => {
        if (collection.id === sourceCollectionId) {
          return {
            ...collection,
            requests: collection.requests.filter(r => r.id !== requestId),
          };
        }
        if (collection.collections) {
          return {
            ...collection,
            collections: removeFromSource(collection.collections),
          };
        }
        return collection;
      });
    };

    // Add to target collection
    const addToTarget = (cols: Collection[]): Collection[] => {
      return cols.map(collection => {
        if (collection.id === targetCollectionId) {
          // Check if request already exists in target
          const exists = collection.requests.some(r => r.id === requestId);
          if (!exists) {
            return {
              ...collection,
              requests: [...collection.requests, { ...request, collectionId: targetCollectionId }],
            };
          }
          return collection;
        }
        if (collection.collections) {
          return {
            ...collection,
            collections: addToTarget(collection.collections),
          };
        }
        return collection;
      });
    };

    let updatedCollections = removeFromSource(collections);
    updatedCollections = addToTarget(updatedCollections);
    setCollections(updatedCollections);

    // Update savedRequests
    const updatedSavedRequests = savedRequests.map(req =>
      req.id === requestId ? { ...req, collectionId: targetCollectionId } : req
    );
    setSavedRequests(updatedSavedRequests);

    const targetCollection = findCollectionById(targetCollectionId);
    toast({
      title: 'Request Moved',
      description: `Request moved to "${targetCollection?.name || 'collection'}"`,
    });
  };

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string);
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragId(null);

    if (!over) return;

    const requestId = active.id as string;
    const targetCollectionId = over.id as string;

    // Find source collection
    const findSourceCollection = (cols: Collection[]): string | null => {
      for (const col of cols) {
        if (col.requests.some(r => r.id === requestId)) {
          return col.id;
        }
        if (col.collections) {
          const found = findSourceCollection(col.collections);
          if (found) return found;
        }
      }
      return null;
    };

    const sourceCollectionId = findSourceCollection(collections);
    if (!sourceCollectionId) return;

    // Don't allow dropping on the same collection or on a request
    if (targetCollectionId === sourceCollectionId) return;

    // Verify target is a collection (not a request)
    const targetCollection = findCollectionById(targetCollectionId);
    if (!targetCollection) return;

    moveRequestToCollection(requestId, targetCollectionId, sourceCollectionId);
  };

  // Draggable Request Component
  const DraggableRequest = ({ request, collectionId }: { request: SavedRequest; collectionId: string }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
      id: request.id,
      data: {
        type: 'request',
        request,
        collectionId,
      },
    });

    const style = {
      transform: CSS.Translate.toString(transform),
      opacity: isDragging ? 0.5 : 1,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        className={`px-3 py-1.5 rounded-md hover:bg-muted/50 transition-colors flex items-center gap-2 group/request cursor-grab active:cursor-grabbing ${
          isDragging ? 'opacity-50' : ''
        }`}
        onClick={(e) => {
          // Only load request if not dragging
          if (!isDragging) {
            e.stopPropagation();
            // Hold Shift to duplicate, otherwise switch to existing tab if open
            const shouldDuplicate = e.shiftKey;
            loadRequest(request, shouldDuplicate);
          }
        }}
      >
        <Badge 
          variant="outline" 
          className={`font-mono text-[10px] font-semibold px-1.5 py-0 border ${getMethodColor(request.method)}`}
        >
          {request.method}
        </Badge>
        <span className="text-sm truncate flex-1 text-foreground/90 group-hover/request:text-foreground">
          {request.name}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover/request:opacity-100 hover:bg-muted transition-opacity shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                loadRequest(request, false);
              }}
            >
              <Radio className="h-4 w-4 mr-2" />
              Open
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                loadRequest(request, true);
              }}
            >
              <Copy className="h-4 w-4 mr-2" />
              Duplicate
              <DropdownMenuShortcut>D</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                handleEditRequest(collectionId, request.id);
              }}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit
              <DropdownMenuShortcut>E</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteRequest(collectionId, request.id, request.name);
              }}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
              <DropdownMenuShortcut>Del</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  };

  // Droppable Collection Component
  const DroppableCollection = ({ 
    collectionId, 
    children, 
    className 
  }: { 
    collectionId: string; 
    children: React.ReactNode; 
    className?: string;
  }) => {
    const { setNodeRef, isOver } = useDroppable({
      id: collectionId,
      data: {
        type: 'collection',
      },
    });

    return (
      <div
        ref={setNodeRef}
        className={`${className || ''} ${isOver ? 'ring-2 ring-primary ring-offset-2 bg-primary/5 rounded-md' : ''}`}
      >
        {children}
      </div>
    );
  };

  // Recursive component to render collections with nested collections
  const renderCollection = (col: Collection, depth: number = 0) => {
    const isExpanded = expandedCollections.has(col.id);
    const indent = depth * 16;

    return (
      <DroppableCollection key={col.id} collectionId={col.id}>
        <Collapsible
          open={isExpanded}
          onOpenChange={() => toggleCollection(col.id)}
        >
          <div className="group/collection">
            <div 
              className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted/50 transition-colors"
              style={{ paddingLeft: `${8 + indent}px` }}
            >
              <CollapsibleTrigger className="flex items-center gap-2 flex-1 min-w-0 text-left">
                <ChevronRight
                  className={`h-4 w-4 text-muted-foreground transition-transform duration-200 shrink-0 ${
                    isExpanded ? 'rotate-90' : ''
                  }`}
                />
                <Folder className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm truncate text-foreground">{col.name}</span>
              </CollapsibleTrigger>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 group-hover/collection:opacity-100 hover:bg-muted transition-opacity shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => handleNewRequestInCollection(col.id)}>
                  <FilePlus className="h-4 w-4 mr-2" />
                  New Request
                  <DropdownMenuShortcut>R</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    if (!user?.uid) {
                      window.location.href = '/login';
                      return;
                    }
                    setParentCollectionId(col.id);
                    setNewCollectionName('');
                    setCollectionNameError('');
                    setShowCreateCollectionDialog(true);
                  }}
                >
                  <FolderPlus className="h-4 w-4 mr-2" />
                  New Folder
                  <DropdownMenuShortcut>N</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    toast({
                      title: 'Feature Coming Soon',
                      description: 'Run collection feature will be available soon',
                    });
                  }}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Run collection
                  <DropdownMenuShortcut>T</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleEditCollection(col.id)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                  <DropdownMenuShortcut>E</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    toast({
                      title: 'Feature Coming Soon',
                      description: 'Sort feature will be available soon',
                    });
                  }}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Sort
                  <DropdownMenuShortcut>S</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDuplicateCollection(col.id)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                  <DropdownMenuShortcut>D</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportCollection(col.id)}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                  <DropdownMenuShortcut>X</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleDeleteCollection(col.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                  <DropdownMenuShortcut>Del</DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <CollapsibleContent>
            <div className="ml-4">
              {/* Render nested collections */}
              {col.collections && col.collections.length > 0 && (
                <div className="space-y-0">
                  {col.collections.map((nestedCol) => renderCollection(nestedCol, depth + 1))}
                </div>
              )}
              {/* Render requests */}
              <div className="space-y-0.5 mt-1" style={{ paddingLeft: `${indent + 16}px` }}>
                {col.requests.length === 0 && (!col.collections || col.collections.length === 0) ? (
                  <div className="px-3 py-2 text-xs text-muted-foreground">
                    Empty collection
                  </div>
                ) : (
                  col.requests.map((req) => (
                    <DraggableRequest key={req.id} request={req} collectionId={col.id} />
                  ))
                )}
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
      </DroppableCollection>
    );
  };

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-background">
      {/* Left Protocol Sidebar */}
      <div className="w-20 border-r bg-muted/30 flex flex-col items-center py-4 gap-2">
        <Button
          variant={protocol === 'REST' ? 'default' : 'ghost'}
          size="icon"
          className={`w-14 h-14 rounded-lg transition-all ${
            protocol === 'REST' 
              ? 'bg-primary text-primary-foreground shadow-md' 
              : 'hover:bg-muted'
          }`}
          onClick={() => setProtocol('REST')}
          title="REST API"
        >
          <Globe className="h-5 w-5" />
        </Button>
        <Button
          variant={protocol === 'WebSocket' ? 'default' : 'ghost'}
          size="icon"
          className={`w-14 h-14 rounded-lg transition-all ${
            protocol === 'WebSocket' 
              ? 'bg-primary text-primary-foreground shadow-md' 
              : 'hover:bg-muted opacity-50'
          }`}
          onClick={() => {
            toast({
              title: 'Coming Soon',
              description: 'WebSocket support will be available soon',
            });
          }}
          title="WebSocket (Coming Soon)"
          disabled
        >
          <Radio className="h-5 w-5" />
        </Button>
        <Button
          variant={protocol === 'GraphQL' ? 'default' : 'ghost'}
          size="icon"
          className={`w-14 h-14 rounded-lg transition-all ${
            protocol === 'GraphQL' 
              ? 'bg-primary text-primary-foreground shadow-md' 
              : 'hover:bg-muted opacity-50'
          }`}
          onClick={() => {
            toast({
              title: 'Coming Soon',
              description: 'GraphQL support will be available soon',
            });
          }}
          title="GraphQL (Coming Soon)"
          disabled
        >
          <Code className="h-5 w-5" />
        </Button>
        <div className="flex-1" />
        <Button
          variant="ghost"
          size="icon"
          className="w-14 h-14 rounded-lg hover:bg-muted"
          title="Settings"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center justify-between px-4 h-14">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-semibold">
                {protocol}
              </Badge>
              <span className="text-xs text-muted-foreground">API Client</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="h-8">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </div>
        </div>

        {/* Request Tabs */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center overflow-x-auto">
            {requestTabs.map((tab) => (
              <div
                key={tab.id}
                className={`group flex items-center gap-2.5 px-4 py-3 border-r cursor-pointer min-w-[200px] transition-all ${
                  activeTabId === tab.id 
                    ? 'bg-background border-b-2 border-b-primary shadow-sm' 
                    : 'hover:bg-muted/30'
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
            <div className="flex gap-3 items-center bg-card p-4 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
              <Select value={activeTab.method} onValueChange={(value) => updateActiveTab({ method: value as HttpMethod })}>
                <SelectTrigger className={`w-32 font-mono font-semibold h-11 ${getMethodColor(activeTab.method)}`}>
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
                placeholder="https://api.example.com/endpoint or paste cURL command"
                value={activeTab.url}
                onChange={(e) => updateActiveTab({ url: e.target.value })}
                onPaste={handleUrlPaste}
                className="font-mono flex-1 h-11 text-sm border-2 focus-visible:ring-2"
              />
              <Button 
                onClick={handleSendRequest} 
                disabled={isLoading || !activeTab.url.trim()}
                className="h-11 px-6 shadow-sm hover:shadow-md transition-all font-semibold"
                size="default"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                {isLoading ? 'Sending...' : 'Send'}
              </Button>
              <Button 
                variant="outline" 
                onClick={openSaveRequestDialog}
                className="h-11 px-4"
              >
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>

            {/* Request Tabs - Params, Body, Headers, Auth */}
            <Tabs defaultValue="params" className="w-full">
              <TabsList className="h-12 bg-muted/30 p-1 rounded-lg">
                <TabsTrigger 
                  value="params" 
                  className="text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm px-4"
                >
                  Params
                  {activeTab.params.filter(p => p.enabled).length > 0 && (
                    <Badge variant="secondary" className="ml-2 text-xs px-1.5 py-0.5 font-medium">
                      {activeTab.params.filter(p => p.enabled).length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger 
                  value="body" 
                  className="text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm px-4"
                >
                  Body
                </TabsTrigger>
                <TabsTrigger 
                  value="headers" 
                  className="text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm px-4"
                >
                  Headers
                  {activeTab.headers.filter(h => h.enabled).length > 0 && (
                    <Badge variant="secondary" className="ml-2 text-xs px-1.5 py-0.5 font-medium">
                      {activeTab.headers.filter(h => h.enabled).length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger 
                  value="auth" 
                  className="text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm px-4"
                >
                  Authorization
                </TabsTrigger>
              </TabsList>

              <TabsContent value="params" className="mt-4">
                <div className="border rounded-xl overflow-hidden shadow-sm bg-card">
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
                  <div className="space-y-4 bg-card p-5 rounded-xl border shadow-sm">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold">Body Type</Label>
                      <Tabs value={activeTab.bodyType} onValueChange={(value) => updateActiveTab({ bodyType: value as BodyType })}>
                        <TabsList className="bg-muted/30 p-1 rounded-lg h-9">
                          <TabsTrigger value="json" className="data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs px-3">JSON</TabsTrigger>
                          <TabsTrigger value="text" className="data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs px-3">Text</TabsTrigger>
                          <TabsTrigger value="form-data" className="data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs px-3">Form Data</TabsTrigger>
                          <TabsTrigger value="x-www-form-urlencoded" className="data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs px-3">URL Encoded</TabsTrigger>
                          <TabsTrigger value="raw" className="data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs px-3">Raw</TabsTrigger>
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
                      className="font-mono min-h-[300px] text-sm bg-background/50 border-2 focus-visible:ring-2 rounded-lg"
                    />
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-16 bg-card p-8 rounded-lg border">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">This request method doesn't support a body</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="headers" className="mt-4">
                <div className="border rounded-xl overflow-hidden shadow-sm bg-card">
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
              <div className="space-y-4 border-t pt-6 mt-8">
                <div className="flex items-center justify-between bg-card p-4 rounded-xl border shadow-sm">
                  <div className="flex items-center gap-3 flex-wrap">
                    <Label className="text-lg font-semibold">Response</Label>
                    <Badge className={`${getStatusColor(response.status)} px-3 py-1 font-semibold`}>
                      {response.status >= 200 && response.status < 300 ? (
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 inline" />
                      ) : response.status >= 400 ? (
                        <AlertCircle className="w-3.5 h-3.5 mr-1.5 inline" />
                      ) : null}
                      {response.status} {response.statusText}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1.5 px-3 py-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="font-medium">{response.time}ms</span>
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="shadow-sm hover:shadow-md transition-shadow"
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
                  <TabsList className="bg-muted/30 p-1 rounded-lg h-11">
                    <TabsTrigger value="body" className="data-[state=active]:bg-background data-[state=active]:shadow-sm px-4">Body</TabsTrigger>
                    <TabsTrigger value="headers" className="data-[state=active]:bg-background data-[state=active]:shadow-sm px-4">Headers</TabsTrigger>
                  </TabsList>
                  <TabsContent value="body" className="mt-4">
                    <div className="border rounded-xl p-4 bg-muted/20 backdrop-blur-sm min-h-[300px] max-h-[600px] overflow-auto shadow-inner">
                      {response.status === 0 ? (
                        <div className="text-red-500 dark:text-red-400 font-mono text-sm flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                          <span>{response.body}</span>
                        </div>
                      ) : (
                        <pre className="font-mono text-sm whitespace-pre-wrap break-words leading-relaxed text-foreground/90">
                          {response.body}
                        </pre>
                      )}
                    </div>
                  </TabsContent>
                  <TabsContent value="headers" className="mt-4">
                    <div className="border rounded-xl p-4 bg-muted/20 backdrop-blur-sm min-h-[300px] max-h-[600px] overflow-auto shadow-inner">
                      <pre className="font-mono text-sm whitespace-pre-wrap break-words leading-relaxed text-foreground/90">
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

      {/* Collapsed Sidebar Button - Always visible when sidebar is closed */}
      {!sidebarOpen && (
        <div className="fixed right-0 top-1/2 -translate-y-1/2 z-[100] animate-in slide-in-from-right">
          <Button
            variant="default"
            size="icon"
            className="h-14 w-10 rounded-r-none rounded-l-xl shadow-2xl border-2 border-primary bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 transition-transform"
            onClick={() => setSidebarOpen(true)}
            title="Show Collections"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
        </div>
      )}

      {/* Alternative: Thin vertical bar when collapsed */}
      {!sidebarOpen && (
        <div 
          className="fixed right-0 top-0 bottom-0 w-1 bg-primary/30 hover:bg-primary z-40 cursor-pointer transition-colors"
          onClick={() => setSidebarOpen(true)}
          title="Click to show Collections"
        />
      )}

      {/* Sidebar */}
      {sidebarOpen && (
        <div className="w-80 border-l bg-background flex flex-col shadow-lg">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-base">Collections</h2>
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)} className="h-8 w-8">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search" 
                className="h-9 pl-9 bg-background" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              variant="default"
              size="sm"
              className="w-full h-9 font-medium"
              onClick={() => {
                if (!user?.uid) {
                  window.location.href = '/login';
                  return;
                }
                setParentCollectionId(undefined);
                setNewCollectionName('');
                setCollectionNameError('');
                setShowCreateCollectionDialog(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              New
            </Button>
          </div>
          <ScrollArea className="flex-1">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <div className="p-2">
                {isLoadingCollections ? (
                  <div className="p-8 text-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Loading collections...</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-0">
                      {filteredCollections.map((col) => renderCollection(col))}
                    </div>
                    {filteredCollections.length === 0 && !isLoadingCollections && (
                      <div className="p-8 text-center">
                        {searchQuery ? (
                          <>
                            <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                            <p className="text-sm text-muted-foreground mb-1">No results found</p>
                            <p className="text-xs text-muted-foreground">Try adjusting your search query</p>
                          </>
                        ) : collections.length === 0 ? (
                          <>
                            <FolderPlus className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                            <p className="text-sm text-muted-foreground mb-1">No collections yet</p>
                            <p className="text-xs text-muted-foreground">Create one to get started</p>
                          </>
                        ) : (
                          <>
                            <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                            <p className="text-sm text-muted-foreground">No matching requests found</p>
                          </>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
              <DragOverlay>
                {activeDragId ? (
                  <div className="px-3 py-1.5 rounded-md bg-background border shadow-lg flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={`font-mono text-[10px] font-semibold px-1.5 py-0 border ${
                        savedRequests.find(r => r.id === activeDragId) 
                          ? getMethodColor(savedRequests.find(r => r.id === activeDragId)!.method)
                          : ''
                      }`}
                    >
                      {savedRequests.find(r => r.id === activeDragId)?.method || 'GET'}
                    </Badge>
                    <span className="text-sm truncate">
                      {savedRequests.find(r => r.id === activeDragId)?.name || 'Request'}
                    </span>
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          </ScrollArea>
        </div>
      )}

      {/* Create Collection Dialog */}
      <Dialog 
        open={showCreateCollectionDialog} 
        onOpenChange={(open) => {
          setShowCreateCollectionDialog(open);
          if (!open) {
            setNewCollectionName('');
            setCollectionNameError('');
            setParentCollectionId(undefined);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {parentCollectionId ? 'Create New Folder' : 'Create New Collection'}
            </DialogTitle>
            <DialogDescription>
              {parentCollectionId 
                ? `Enter a name for the new folder. The name must be unique within this collection.`
                : 'Enter a name for your new collection. The name must be unique.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="collection-name">
                {parentCollectionId ? 'Folder Name' : 'Collection Name'}
              </Label>
              <Input
                id="collection-name"
                placeholder={parentCollectionId ? 'My Folder' : 'My Collection'}
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
                setParentCollectionId(undefined);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateCollection}>
              {parentCollectionId ? 'Create Folder' : 'Create'}
            </Button>
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
                      <SelectContent className="max-h-[300px]">
                        {renderCollectionOptions(collections)}
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
              Are you sure you want to delete the collection "{findCollectionById(deleteCollectionId || '')?.name}"? 
              This will permanently delete the collection and all nested collections and requests in it. 
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

      {/* Edit Collection Dialog */}
      <Dialog open={editCollectionId !== null} onOpenChange={(open) => !open && setEditCollectionId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Collection Name</DialogTitle>
            <DialogDescription>
              Enter a new name for the collection. The name must be unique.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-collection-name">Collection Name</Label>
              <Input
                id="edit-collection-name"
                placeholder="My Collection"
                value={editCollectionName}
                onChange={(e) => {
                  setEditCollectionName(e.target.value);
                  setEditCollectionNameError('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    confirmEditCollection();
                  }
                }}
                autoFocus
              />
              {editCollectionNameError && (
                <p className="text-sm text-destructive">{editCollectionNameError}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditCollectionId(null);
                setEditCollectionName('');
                setEditCollectionNameError('');
              }}
            >
              Cancel
            </Button>
            <Button onClick={confirmEditCollection}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Request Dialog */}
      <Dialog open={editRequestInfo !== null} onOpenChange={(open) => !open && setEditRequestInfo(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Request Name</DialogTitle>
            <DialogDescription>
              Enter a new name for the request. The name must be unique within the collection.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-request-name">Request Name</Label>
              <Input
                id="edit-request-name"
                placeholder="My Request"
                value={editRequestName}
                onChange={(e) => {
                  setEditRequestName(e.target.value);
                  setEditRequestNameError('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    confirmEditRequest();
                  }
                }}
                autoFocus
              />
              {editRequestNameError && (
                <p className="text-sm text-destructive">{editRequestNameError}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditRequestInfo(null);
                setEditRequestName('');
                setEditRequestNameError('');
              }}
            >
              Cancel
            </Button>
            <Button onClick={confirmEditRequest}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
