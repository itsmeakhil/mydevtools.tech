"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
  limit,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
  orderBy,
  getDocs,
  limitToLast,
  endBefore,
  serverTimestamp,
  QuerySnapshot,
  where,
} from "firebase/firestore";
import { db } from "../../../../database/firebase";
import { Task, NewTask } from "@/app/app/to-do/types/Task";
import { format } from "date-fns";
import useAuth from "@/utils/useAuth";

interface TaskContextType {
  tasks: Task[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  fetchNextPage: () => void;
  fetchPreviousPage: () => void;
  handlePageChange: (page: number) => void;
  addTask: (text: string) => Promise<void>;
  updateTaskStatus: (taskId: string, newStatus: "not-started" | "ongoing" | "completed") => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
}

interface StatusOrderMap {
  ongoing: number;
  "not-started": number;
  completed: number;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastDoc, setLastDoc] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [firstDoc, setFirstDoc] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [pageCache, setPageCache] = useState<
    Map<number, QueryDocumentSnapshot<DocumentData>>
  >(new Map());
  const tasksPerPage = 7;
  const user = useAuth();
  const unsubscribers = useRef<(() => void)[]>([]);

  // Modify the cleanup function to be less aggressive
  const cleanupListeners = useCallback(() => {
    if (unsubscribers.current.length > 0) {
      unsubscribers.current.forEach(unsubscribe => unsubscribe());
      unsubscribers.current = [];
    }
  }, []);

  // Modified error handler
  const handleFirestoreError = useCallback((error: { code: string }) => {
    if (error.code === 'permission-denied') {
      console.warn('Permission denied, cleaning up listeners');
      cleanupListeners();
    } else {
      console.error('Firestore error:', error);
    }
  }, [cleanupListeners]);

  // Modified total pages calculation
  useEffect(() => {
    if (!user || !user.uid) {
      cleanupListeners();
      return;
    }

    const unsubscribe = onSnapshot(
      query(
        collection(db, "tasks"),
        where("created_by", "==", user.uid),
        orderBy("createdAt", "desc")
      ),
      async (snapshot) => {
        // Get actual count of documents
        const actualCount = snapshot.size;
        const calculatedPages = Math.max(
          1,
          Math.ceil(actualCount / tasksPerPage)
        );

        // Only update if the calculated pages is different
        if (calculatedPages !== totalPages) {
          setTotalPages(calculatedPages);

          // If current page is beyond the new total, reset to last valid page
          if (currentPage > calculatedPages) {
            setCurrentPage(calculatedPages);
            // Fetch the last page
            const lastPageQuery = query(
              collection(db, "tasks"),
              where("created_by", "==", user.uid),
              orderBy("createdAt", "desc"),
              limit(tasksPerPage)
            );
            const querySnapshot = await getDocs(lastPageQuery);
            updateTasksFromSnapshot(querySnapshot);
          }
        }
      },
      handleFirestoreError
    );

    unsubscribers.current.push(unsubscribe);
    return () => {
      cleanupListeners();
    };
  }, [currentPage, totalPages, user, cleanupListeners, handleFirestoreError]);

  // Helper function to update tasks from snapshot
  const updateTasksFromSnapshot = (
    querySnapshot: QuerySnapshot<DocumentData>
  ) => {
    const tasksArray: Task[] = [];
    querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
      const data = doc.data();
      tasksArray.push({
        id: doc.id,
        text: data.text,
        status: data.status,
        statusOrder: data.statusOrder,
        createdAt: data.createdAt
          ? format(data.createdAt.toDate(), "dd MMM yyyy, hh:mm a")
          : "Unknown",
        created_by: data.created_by,
      });
    });
    setTasks(tasksArray);
    if (querySnapshot.docs.length > 0) {
      setFirstDoc(querySnapshot.docs[0]);
      setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
    }
  };

  // Modified query creation helper function with proper typing
  const createTaskQuery = useCallback((baseQuery: boolean) => {
    if (!user?.uid) return null;

    if (baseQuery) {
      return query(
        collection(db, "tasks"),
        where("created_by", "==", user.uid),
        orderBy("statusOrder"),
        orderBy("createdAt", "desc"),
        limit(tasksPerPage)
      );
    }
    return query(
      collection(db, "tasks"),
      where("created_by", "==", user.uid),
      orderBy("statusOrder"),
      orderBy("createdAt", "desc")
    );
  }, [user?.uid, tasksPerPage]);

  // Add this new function to refresh current page
  const refreshCurrentPage = useCallback(async () => {
    if (!user?.uid) return;
    setIsLoading(true);

    try {
      const q = query(
        collection(db, "tasks"),
        where("created_by", "==", user.uid),
        orderBy("statusOrder"),
        orderBy("createdAt", "desc"),
        limit(currentPage * tasksPerPage)
      );

      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs;
      
      // If we have no documents and we're not on the first page, go back one page
      if (docs.length === 0 && currentPage > 1) {
        setCurrentPage(prev => Math.max(1, prev - 1));
        return await refreshCurrentPage();
      }

      const startIndex = (currentPage - 1) * tasksPerPage;
      const pageDocs = docs.slice(
        startIndex,
        Math.min(startIndex + tasksPerPage, docs.length)
      );

      // Update tasks immediately
      const tasksArray = pageDocs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          text: data.text,
          status: data.status,
          statusOrder: data.statusOrder,
          createdAt: data.createdAt
            ? format(data.createdAt.toDate(), "dd MMM yyyy, hh:mm a")
            : "Unknown",
          created_by: data.created_by,
        };
      });

      setTasks(tasksArray);
      
      if (pageDocs.length > 0) {
        setFirstDoc(pageDocs[0]);
        setLastDoc(pageDocs[pageDocs.length - 1]);
      }

      // Update totalPages
      const totalDocs = await getDocs(
        query(
          collection(db, "tasks"),
          where("created_by", "==", user.uid)
        )
      );
      setTotalPages(Math.max(1, Math.ceil(totalDocs.size / tasksPerPage)));

      // Update cache
      const newCache = new Map<number, QueryDocumentSnapshot<DocumentData>>();
      docs.forEach((doc, index) => {
        const pageNumber = Math.floor(index / tasksPerPage) + 1;
        if (!newCache.has(pageNumber)) {
          newCache.set(pageNumber, doc);
        }
      });
      setPageCache(newCache);
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid, currentPage, tasksPerPage]);

  // Initial page load
  useEffect(() => {
    if (!user || !user.uid) {
      cleanupListeners();
      return;
    }

    setIsLoading(true);
    const q = createTaskQuery(true);
    if (!q) return;

    const unsubscribe = onSnapshot(
      q, 
      async (querySnapshot) => {
        updateTasksFromSnapshot(querySnapshot);
        await refreshCurrentPage();
        setIsLoading(false);
      },
      handleFirestoreError
    );

    unsubscribers.current.push(unsubscribe);
    return () => {
      cleanupListeners();
    };
  }, [user, createTaskQuery, refreshCurrentPage, cleanupListeners, handleFirestoreError]);

  const fetchNextPage = useCallback(() => {
    if (currentPage >= totalPages || !lastDoc || !user || !user.uid) return;
    const q = query(
      collection(db, "tasks"),
      where("created_by", "==", user.uid),
      orderBy("statusOrder"),
      orderBy("createdAt", "desc"),
      startAfter(lastDoc),
      limit(tasksPerPage)
    );
    const unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        if (querySnapshot.empty) {
          // If no more documents, don't update anything
          return;
        }
        updateTasksFromSnapshot(querySnapshot);
        setPageCache((prev) => {
          const newCache = new Map(prev);
          newCache.set(currentPage + 1, querySnapshot.docs[0]);
          return newCache;
        });
        setCurrentPage(currentPage + 1);
      },
      handleFirestoreError
    );

    unsubscribers.current.push(unsubscribe);
  }, [currentPage, totalPages, lastDoc, user, handleFirestoreError]);

  const fetchPreviousPage = useCallback(() => {
    if (currentPage <= 1 || !firstDoc || !user || !user.uid) return;
    const q = query(
      collection(db, "tasks"),
      where("created_by", "==", user.uid),
      orderBy("statusOrder"),
      orderBy("createdAt", "desc"),
      endBefore(firstDoc),
      limitToLast(tasksPerPage)
    );
    const unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        if (querySnapshot.empty) {
          // If no more documents, don't update anything
          return;
        }
        updateTasksFromSnapshot(querySnapshot);
        setPageCache((prev) => {
          const newCache = new Map(prev);
          newCache.set(currentPage - 1, querySnapshot.docs[0]);
          return newCache;
        });
        setCurrentPage(currentPage - 1);
      },
      handleFirestoreError
    );

    unsubscribers.current.push(unsubscribe);
  }, [currentPage, firstDoc, user, handleFirestoreError]);

  const handlePageChange = async (page: number) => {
    if (page === currentPage || page > totalPages || page < 1 || !user || !user.uid) return;

    if (page === currentPage + 1) {
      fetchNextPage();
      return;
    }
    if (page === currentPage - 1) {
      fetchPreviousPage();
      return;
    }

    const cachedDoc = pageCache.get(page);
    if (cachedDoc) {
      const q = query(
        collection(db, "tasks"),
        where("created_by", "==", user.uid),
        orderBy("statusOrder"),
        orderBy("createdAt", "desc"),
        startAfter(cachedDoc),
        limit(tasksPerPage)
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        updateTasksFromSnapshot(querySnapshot);
        setCurrentPage(page);
      }
      return;
    }

    // If not cached, fetch from beginning
    const q = query(
      collection(db, "tasks"),
      where("created_by", "==", user.uid),
      orderBy("statusOrder"),
      orderBy("createdAt", "desc"),
      limit(page * tasksPerPage)
    );
    const querySnapshot = await getDocs(q);
    const docs = querySnapshot.docs;
    if (docs.length === 0) return;

    const startIndex = (page - 1) * tasksPerPage;
    const pageDocs = docs.slice(
      startIndex,
      Math.min(startIndex + tasksPerPage, docs.length)
    );

    const tasksArray: Task[] = [];
    pageDocs.forEach((doc) => {
      const data = doc.data();
      tasksArray.push({
        id: doc.id,
        text: data.text,
        status: data.status,
        statusOrder: data.statusOrder,
        createdAt: data.createdAt
          ? format(data.createdAt.toDate(), "dd MMM yyyy, hh:mm a")
          : "Unknown",
        created_by: data.created_by,
      });
    });

    setTasks(tasksArray);
    setFirstDoc(pageDocs[0]);
    setLastDoc(pageDocs[pageDocs.length - 1]);

    setPageCache((prev) => {
      const newCache = new Map(prev);
      newCache.set(page, pageDocs[0]);
      return newCache;
    });

    setCurrentPage(page);
  };

  const addTask = async (newTaskText: string): Promise<void> => {
    if (!user || !user.uid) return;
    const newTask: NewTask = {
      text: newTaskText,
      status: "not-started",
      statusOrder: 2, // Add statusOrder field
      createdAt: serverTimestamp(),
      created_by: user.uid,
    };
    await addDoc(collection(db, "tasks"), newTask);
  };

  // Simplified updateTaskStatus that updates the UI optimistically
  const updateTaskStatus = async (
    taskId: string,
    newStatus: "not-started" | "ongoing" | "completed"
  ): Promise<void> => {
    const statusOrder: StatusOrderMap = {
      ongoing: 1,
      "not-started": 2,
      completed: 3,
    };
    
    if (newStatus in statusOrder) {
      // Update local state immediately
      setTasks(currentTasks => 
        currentTasks.map(task => 
          task.id === taskId 
            ? { 
                ...task, 
                status: newStatus, 
                statusOrder: statusOrder[newStatus] 
              } 
            : task
        )
      );

      // Update database in background
      try {
        await updateDoc(doc(db, "tasks", taskId), {
          status: newStatus,
          statusOrder: statusOrder[newStatus as keyof StatusOrderMap],
        });
      } catch (error) {
        console.error('Failed to update task:', error);
        // Revert local state if update fails
        await refreshCurrentPage();
      }
    }
  };

  // Simplified deleteTask with optimistic updates
  const deleteTask = async (taskId: string): Promise<void> => {
    if (!user?.uid) return;
    
    // Remove from local state immediately
    setTasks(currentTasks => currentTasks.filter(task => task.id !== taskId));

    try {
      await deleteDoc(doc(db, "tasks", taskId));
      // Only refresh if we need to update pagination
      if (tasks.length === 1 && currentPage > 1) {
        await refreshCurrentPage();
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
      // Revert local state if delete fails
      await refreshCurrentPage();
    }
  };

  // Simplified real-time listener
  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, "tasks"),
      where("created_by", "==", user.uid),
      orderBy("statusOrder"),
      orderBy("createdAt", "desc"),
      limit(tasksPerPage)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.metadata.hasPendingWrites) {
        updateTasksFromSnapshot(snapshot);
      }
    }, handleFirestoreError);

    return () => unsubscribe();
  }, [user?.uid, currentPage, handleFirestoreError]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupListeners();
    };
  }, [cleanupListeners]);

  return (
    <TaskContext.Provider
      value={{
        tasks,
        isLoading,  // Simplified loading state
        currentPage,
        totalPages,
        fetchNextPage,
        fetchPreviousPage,
        handlePageChange,
        addTask,
        updateTaskStatus,
        deleteTask,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("useTaskContext must be used within a TaskProvider");
  }
  return context;
};

