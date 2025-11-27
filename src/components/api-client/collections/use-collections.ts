"use client"

import * as React from "react"
import { Collection, CollectionFolder, CollectionRequest } from "../types"
import { toast } from "sonner"

const STORAGE_KEY = "api-client-collections"

export function useCollections() {
    const [collections, setCollections] = React.useState<Collection[]>([])

    React.useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
            try {
                setCollections(JSON.parse(stored))
            } catch (e) {
                console.error("Failed to parse collections", e)
            }
        } else {
            // Initialize with a default collection
            setCollections([{ id: crypto.randomUUID(), name: "My Collection", items: [] }])
        }
    }, [])

    React.useEffect(() => {
        if (collections.length > 0) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(collections))
        }
    }, [collections])

    const addFolder = (parentId: string, name: string) => {
        const newFolder: CollectionFolder = {
            id: crypto.randomUUID(),
            name,
            type: "folder",
            items: [],
            isOpen: true,
        }

        const addItemToParent = (items: (CollectionFolder | CollectionRequest)[]): (CollectionFolder | CollectionRequest)[] => {
            return items.map((item) => {
                if ("type" in item && item.type === "folder") {
                    if (item.id === parentId) {
                        return { ...item, items: [...item.items, newFolder], isOpen: true }
                    }
                    return { ...item, items: addItemToParent(item.items) }
                }
                return item
            })
        }

        // Check if parent is a collection root
        const collectionIndex = collections.findIndex(c => c.id === parentId)
        if (collectionIndex !== -1) {
            const newCollections = [...collections]
            newCollections[collectionIndex] = {
                ...newCollections[collectionIndex],
                items: [...newCollections[collectionIndex].items, newFolder]
            }
            setCollections(newCollections)
            return
        }

        setCollections((prev) =>
            prev.map((col) => ({
                ...col,
                items: addItemToParent(col.items),
            }))
        )
    }

    const deleteItem = (itemId: string) => {
        const deleteFromItems = (items: (CollectionFolder | CollectionRequest)[]): (CollectionFolder | CollectionRequest)[] => {
            return items
                .filter((item) => item.id !== itemId)
                .map((item) => {
                    if ("type" in item && item.type === "folder") {
                        return { ...item, items: deleteFromItems(item.items) }
                    }
                    return item
                })
        }

        setCollections((prev) =>
            prev.map((col) => ({
                ...col,
                items: deleteFromItems(col.items),
            }))
        )
    }

    const saveRequest = (parentId: string, request: CollectionRequest) => {
        const addItemToParent = (items: (CollectionFolder | CollectionRequest)[]): (CollectionFolder | CollectionRequest)[] => {
            return items.map((item) => {
                if ("type" in item && item.type === "folder") {
                    if (item.id === parentId) {
                        return { ...item, items: [...item.items, request], isOpen: true }
                    }
                    return { ...item, items: addItemToParent(item.items) }
                }
                return item
            })
        }

        // Check if parent is a collection root
        const collectionIndex = collections.findIndex(c => c.id === parentId)
        if (collectionIndex !== -1) {
            const newCollections = [...collections]
            newCollections[collectionIndex] = {
                ...newCollections[collectionIndex],
                items: [...newCollections[collectionIndex].items, request]
            }
            setCollections(newCollections)
            toast.success("Request saved")
            return
        }

        setCollections((prev) =>
            prev.map((col) => ({
                ...col,
                items: addItemToParent(col.items),
            }))
        )
        toast.success("Request saved")
    }

    const toggleFolder = (folderId: string) => {
        const toggleInItems = (items: (CollectionFolder | CollectionRequest)[]): (CollectionFolder | CollectionRequest)[] => {
            return items.map((item) => {
                if ("type" in item && item.type === "folder") {
                    if (item.id === folderId) {
                        return { ...item, isOpen: !item.isOpen }
                    }
                    return { ...item, items: toggleInItems(item.items) }
                }
                return item
            })
        }

        setCollections((prev) =>
            prev.map((col) => ({
                ...col,
                items: toggleInItems(col.items),
            }))
        )
    }

    return {
        collections,
        addFolder,
        deleteItem,
        saveRequest,
        toggleFolder
    }
}
