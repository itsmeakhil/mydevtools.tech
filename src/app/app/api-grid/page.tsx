'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tab';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, ChevronRight,
  Globe, Radio, Code, Settings, Search,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import useAuth from '@/utils/useAuth';
import { db } from '@/database/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Import types and components
import {
  HttpMethod,
  AuthType,
  BodyType,
  ProtocolType,
  KeyValuePair,
  SavedRequest,
  RequestTab,
  ApiResponse,
  Collection,
  defaultHeaders,
} from '@/lib/api-grid/types';
import { buildUrl, buildHeaders, buildBody } from '@/lib/api-grid/helpers';
import { RequestTabs } from '@/components/api-grid/request-tabs';
import { UrlBar } from '@/components/api-grid/url-bar';
import { ParamsTable } from '@/components/api-grid/params-table';
import { HeadersTable } from '@/components/api-grid/headers-table';
import { AuthPanel } from '@/components/api-grid/auth-panel';
import { BodyEditor } from '@/components/api-grid/body-editor';
import { ResponsePanel } from '@/components/api-grid/response-panel';
import { CollectionsSidebar } from '@/components/api-grid/collections-sidebar';
import { SaveRequestDialog } from '@/components/api-grid/save-request-dialog';
import { CreateCollectionDialog } from '@/components/api-grid/create-collection-dialog';

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
  const { toast } = useToast();

  // Memoize activeTab to avoid recalculating on every render
  const activeTab = useMemo(() => {
    return requestTabs.find(t => t.id === activeTabId) || requestTabs[0];
  }, [requestTabs, activeTabId]);

  // Request cancellation ref
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Debounce timer ref for auto-save
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Debounced save collections to Firebase (1 second delay)
  useEffect(() => {
    if (!user?.uid || isLoadingCollections || !collectionsInitialized) {
      return;
    }

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout for debounced save
    saveTimeoutRef.current = setTimeout(async () => {
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
    }, 1000);

    // Cleanup timeout on unmount or dependency change
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
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

  const updateActiveTab = useCallback((updates: Partial<RequestTab>) => {
    setRequestTabs(tabs =>
      tabs.map(tab =>
        tab.id === activeTabId ? { ...tab, ...updates, isModified: true } : tab
      )
    );
  }, [activeTabId]);

  const addNewTab = useCallback(() => {
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
    setRequestTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);
  }, []);

  const closeTab = useCallback((tabId: string) => {
    setRequestTabs(prev => {
      if (prev.length === 1) return prev;
      const newTabs = prev.filter(t => t.id !== tabId);
      if (activeTabId === tabId && newTabs.length > 0) {
        setActiveTabId(newTabs[0].id);
      }
      return newTabs;
    });
  }, [activeTabId]);

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

  // Helper functions to build request parts (called in handleSendRequest)
  const getBuiltUrl = useCallback(() => buildUrl(activeTab), [activeTab]);
  const getBuiltHeaders = useCallback(() => buildHeaders(activeTab), [activeTab]);
  const getBuiltBody = useCallback(() => buildBody(activeTab), [activeTab]);

  // Cancel ongoing request
  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
      toast({
        title: 'Request Cancelled',
        description: 'The request has been cancelled',
      });
    }
  }, [toast]);

  const handleSendRequest = useCallback(async () => {
    if (!activeTab.url.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a URL',
        variant: 'destructive',
      });
      return;
    }

    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new AbortController for this request
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setIsLoading(true);
    setResponse(null);
    const startTime = Date.now();

    try {
      const requestUrl = getBuiltUrl();
      const requestHeaders = getBuiltHeaders();
      const requestBody = getBuiltBody();

      const options: RequestInit = {
        method: activeTab.method,
        headers: requestHeaders,
        signal, // Add abort signal
      };

      if (requestBody !== undefined) {
        options.body = requestBody instanceof FormData ? requestBody : requestBody;
        if (typeof requestBody === 'string' && activeTab.bodyType === 'json' && !requestHeaders['Content-Type']) {
          options.headers = { ...requestHeaders, 'Content-Type': 'application/json' };
        }
      }

      const res = await fetch(requestUrl, options);
      
      // Check if request was aborted
      if (signal.aborted) {
        return;
      }
      
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
      abortControllerRef.current = null;
    } catch (error) {
      // Don't show error if request was aborted
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      
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
      abortControllerRef.current = null;
    }
  }, [activeTab, toast, getBuiltUrl, getBuiltHeaders, getBuiltBody, updateActiveTab]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      // Ctrl/Cmd + Enter: Send request
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (!isLoading && activeTab.url.trim()) {
          handleSendRequest();
        }
      }

      // Ctrl/Cmd + K: Cancel request
      if ((e.ctrlKey || e.metaKey) && e.key === 'k' && isLoading) {
        e.preventDefault();
        cancelRequest();
      }

      // Ctrl/Cmd + T: New tab
      if ((e.ctrlKey || e.metaKey) && e.key === 't') {
        e.preventDefault();
        addNewTab();
      }

      // Ctrl/Cmd + W: Close active tab
      if ((e.ctrlKey || e.metaKey) && e.key === 'w') {
        e.preventDefault();
        if (requestTabs.length > 1) {
          closeTab(activeTabId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLoading, activeTab.url, activeTabId, requestTabs.length, handleSendRequest, cancelRequest, addNewTab, closeTab]);

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


  // HTTP Method colors matching Swagger/OpenAPI style

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
        <RequestTabs
          tabs={requestTabs}
          activeTabId={activeTabId}
          onTabClick={setActiveTabId}
          onTabClose={closeTab}
          onAddTab={addNewTab}
        />

        {/* Request Builder */}
        <div className="flex-1 overflow-auto bg-background">
          <div className="max-w-7xl mx-auto p-6 space-y-6">
            {/* URL Bar */}
            <UrlBar
              activeTab={activeTab}
              isLoading={isLoading}
              onMethodChange={(method) => updateActiveTab({ method })}
              onUrlChange={(url) => updateActiveTab({ url })}
              onUrlPaste={handleUrlPaste}
              onSend={handleSendRequest}
              onCancel={cancelRequest}
              onSave={openSaveRequestDialog}
            />

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
                <ParamsTable
                  params={activeTab.params}
                  onAdd={() => addKeyValue('params')}
                  onUpdate={(id, field, value) => updateKeyValue('params', id, field, value)}
                  onRemove={(id) => removeKeyValue('params', id)}
                />
              </TabsContent>

              <TabsContent value="body" className="mt-4">
                <BodyEditor
                  activeTab={activeTab}
                  onUpdate={updateActiveTab}
                />
              </TabsContent>

              <TabsContent value="headers" className="mt-4">
                <HeadersTable
                  headers={activeTab.headers}
                  onAdd={() => addKeyValue('headers')}
                  onUpdate={(id, field, value) => updateKeyValue('headers', id, field, value)}
                  onRemove={(id) => removeKeyValue('headers', id)}
                />
              </TabsContent>

              <TabsContent value="auth" className="mt-4">
                <AuthPanel
                  activeTab={activeTab}
                  onUpdate={updateActiveTab}
                />
              </TabsContent>
            </Tabs>

            {/* Response Section */}
            {response && <ResponsePanel response={response} />}
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
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-10 h-8 w-8"
            onClick={() => setSidebarOpen(false)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <CollectionsSidebar
            collections={collections}
            savedRequests={savedRequests}
            isLoadingCollections={isLoadingCollections}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            expandedCollections={expandedCollections}
            onToggleCollection={toggleCollection}
            onNewCollection={() => {
              setParentCollectionId(undefined);
              setNewCollectionName('');
              setCollectionNameError('');
              setShowCreateCollectionDialog(true);
            }}
            onNewRequestInCollection={handleNewRequestInCollection}
            onNewFolderInCollection={(collectionId) => {
              setParentCollectionId(collectionId);
              setNewCollectionName('');
              setCollectionNameError('');
              setShowCreateCollectionDialog(true);
            }}
            onLoadRequest={loadRequest}
            onEditCollection={handleEditCollection}
            onEditRequest={handleEditRequest}
            onDeleteCollection={handleDeleteCollection}
            onDeleteRequest={handleDeleteRequest}
            onDuplicateCollection={handleDuplicateCollection}
            onExportCollection={handleExportCollection}
            onMoveRequest={moveRequestToCollection}
            user={user}
          />
        </div>
      )}

      {/* Create Collection Dialog */}
      <CreateCollectionDialog
        open={showCreateCollectionDialog}
        onOpenChange={setShowCreateCollectionDialog}
        collectionName={newCollectionName}
        onCollectionNameChange={(name) => {
          setNewCollectionName(name);
          setCollectionNameError('');
        }}
        collectionNameError={collectionNameError}
        parentCollectionId={parentCollectionId}
        onSubmit={handleCreateCollection}
        onCancel={() => {
          setNewCollectionName('');
          setCollectionNameError('');
          setParentCollectionId(undefined);
        }}
      />

      {/* Save Request Dialog */}
      <SaveRequestDialog
        open={showSaveRequestDialog}
        onOpenChange={setShowSaveRequestDialog}
        collections={collections}
        collectionId={saveCollectionId}
        onCollectionIdChange={(id) => {
          setSaveCollectionId(id);
          setSaveRequestErrors({ ...saveRequestErrors, collection: undefined });
        }}
        collectionName={saveCollectionName}
        onCollectionNameChange={(name) => {
          setSaveCollectionName(name);
          setSaveRequestErrors({ ...saveRequestErrors, collection: undefined });
        }}
        requestName={saveRequestName}
        onRequestNameChange={(name) => {
          setSaveRequestName(name);
          setSaveRequestErrors({ ...saveRequestErrors, request: undefined });
        }}
        showNewCollectionInput={showNewCollectionInput}
        onShowNewCollectionInputChange={(show) => {
          setShowNewCollectionInput(show);
          if (!show && collections.length > 0) {
            setSaveCollectionId(collections[0].id);
          }
          setSaveRequestErrors({ ...saveRequestErrors, collection: undefined });
        }}
        errors={saveRequestErrors}
        onSubmit={handleSaveRequest}
        onCancel={() => {
          setSaveCollectionId('');
          setSaveCollectionName('');
          setSaveRequestName('');
          setSaveRequestErrors({});
          setShowNewCollectionInput(false);
        }}
      />

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
