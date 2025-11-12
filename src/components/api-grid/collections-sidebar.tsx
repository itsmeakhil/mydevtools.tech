'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
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
import {
  ChevronRight,
  Search,
  Plus,
  Folder,
  FolderPlus,
  MoreHorizontal,
  Loader2,
  FilePlus,
  Play,
  Settings,
  Copy,
  Download,
  Trash2,
  Pencil,
  Radio,
} from 'lucide-react';
import { Collection, SavedRequest } from './types';
import { getMethodColor } from './helpers';
import { useToast } from '@/hooks/use-toast';

interface CollectionsSidebarProps {
  collections: Collection[];
  savedRequests: SavedRequest[];
  isLoadingCollections: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  expandedCollections: Set<string>;
  onToggleCollection: (id: string) => void;
  onNewCollection: () => void;
  onNewRequestInCollection: (collectionId: string) => void;
  onNewFolderInCollection: (collectionId: string) => void;
  onLoadRequest: (request: SavedRequest, duplicate?: boolean) => void;
  onEditCollection: (collectionId: string) => void;
  onEditRequest: (collectionId: string, requestId: string) => void;
  onDeleteCollection: (collectionId: string) => void;
  onDeleteRequest: (collectionId: string, requestId: string, requestName: string) => void;
  onDuplicateCollection: (collectionId: string) => void;
  onExportCollection: (collectionId: string) => void;
  onMoveRequest: (requestId: string, targetCollectionId: string, sourceCollectionId: string) => void;
  user?: { uid: string } | null;
}

// Filter collections and requests based on search (recursive)
const filterCollection = (col: Collection, searchQuery: string): Collection | null => {
  const filteredRequests = col.requests.filter(
    (req) =>
      req.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.method.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredNested = col.collections
    ? col.collections.map((c) => filterCollection(c, searchQuery)).filter((c): c is Collection => c !== null)
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

// Draggable Request Component
function DraggableRequest({
  request,
  collectionId,
  onLoadRequest,
  onEditRequest,
  onDeleteRequest,
}: {
  request: SavedRequest;
  collectionId: string;
  onLoadRequest: (request: SavedRequest, duplicate?: boolean) => void;
  onEditRequest: (collectionId: string, requestId: string) => void;
  onDeleteRequest: (collectionId: string, requestId: string, requestName: string) => void;
}) {
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
        if (!isDragging) {
          e.stopPropagation();
          const shouldDuplicate = e.shiftKey;
          onLoadRequest(request, shouldDuplicate);
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
              onLoadRequest(request, false);
            }}
          >
            <Radio className="h-4 w-4 mr-2" />
            Open
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onLoadRequest(request, true);
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
              onEditRequest(collectionId, request.id);
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
              onDeleteRequest(collectionId, request.id, request.name);
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
}

// Droppable Collection Component
function DroppableCollection({
  collectionId,
  children,
  className,
}: {
  collectionId: string;
  children: React.ReactNode;
  className?: string;
}) {
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
}

export function CollectionsSidebar({
  collections,
  savedRequests,
  isLoadingCollections,
  searchQuery,
  onSearchChange,
  expandedCollections,
  onToggleCollection,
  onNewCollection,
  onNewRequestInCollection,
  onNewFolderInCollection,
  onLoadRequest,
  onEditCollection,
  onEditRequest,
  onDeleteCollection,
  onDeleteRequest,
  onDuplicateCollection,
  onExportCollection,
  onMoveRequest,
  user,
}: CollectionsSidebarProps) {
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const filteredCollections = useMemo(() => {
    if (!searchQuery) return collections;
    return collections
      .map((col) => filterCollection(col, searchQuery))
      .filter((col): col is Collection => col !== null);
  }, [collections, searchQuery]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragId(null);

    if (!over) return;

    const requestId = active.id as string;
    const targetCollectionId = over.id as string;

    // Find source collection
    const findSourceCollection = (cols: Collection[]): string | null => {
      for (const col of cols) {
        if (col.requests.some((r) => r.id === requestId)) {
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

    if (targetCollectionId === sourceCollectionId) return;

    onMoveRequest(requestId, targetCollectionId, sourceCollectionId);
  };

  // Recursive component to render collections with nested collections
  const renderCollection = (col: Collection, depth: number = 0) => {
    const isExpanded = expandedCollections.has(col.id);
    const indent = depth * 16;

    return (
      <DroppableCollection key={col.id} collectionId={col.id}>
        <Collapsible open={isExpanded} onOpenChange={() => onToggleCollection(col.id)}>
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
                  <DropdownMenuItem onClick={() => onNewRequestInCollection(col.id)}>
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
                      onNewFolderInCollection(col.id);
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
                  <DropdownMenuItem onClick={() => onEditCollection(col.id)}>
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
                  <DropdownMenuItem onClick={() => onDuplicateCollection(col.id)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate
                    <DropdownMenuShortcut>D</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onExportCollection(col.id)}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                    <DropdownMenuShortcut>X</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDeleteCollection(col.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                    <DropdownMenuShortcut>Del</DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
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
                  <div className="px-3 py-2 text-xs text-muted-foreground">Empty collection</div>
                ) : (
                  col.requests.map((req) => (
                    <DraggableRequest
                      key={req.id}
                      request={req}
                      collectionId={col.id}
                      onLoadRequest={onLoadRequest}
                      onEditRequest={onEditRequest}
                      onDeleteRequest={onDeleteRequest}
                    />
                  ))
                )}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </DroppableCollection>
    );
  };

  return (
    <div className="w-80 border-l bg-background flex flex-col shadow-lg">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-base">Collections</h2>
        </div>
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search"
            className="h-9 pl-9 bg-background"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
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
            onNewCollection();
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
                    savedRequests.find((r) => r.id === activeDragId)
                      ? getMethodColor(savedRequests.find((r) => r.id === activeDragId)!.method)
                      : ''
                  }`}
                >
                  {savedRequests.find((r) => r.id === activeDragId)?.method || 'GET'}
                </Badge>
                <span className="text-sm truncate">
                  {savedRequests.find((r) => r.id === activeDragId)?.name || 'Request'}
                </span>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </ScrollArea>
    </div>
  );
}

