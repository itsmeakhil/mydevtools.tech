"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
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
import { db } from "@/app/app/to-do/database/firebase";
import { Task, NewTask } from "@/app/app/to-do/types/Task";
import { format } from "date-fns";
import useAuth from "@/utils/useAuth";

interface TaskContextType {
  tasks: Task[];
  currentPage: number;
  totalPages: number;
  fetchNextPage: () => void;
  fetchPreviousPage: () => void;
  handlePageChange: (page: number) => void;
  addTask: (text: string) => Promise<void>;
  updateTaskStatus: (taskId: string, newStatus: string) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
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

  // Modified total pages calculation
  useEffect(() => {
    if (!user || !user.uid) return;

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
      }
    );

    return () => unsubscribe();
  }, [currentPage, totalPages, user]);

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

  // Initial page load
  useEffect(() => {
    if (!user || !user.uid) return;

    const q = query(
      collection(db, "tasks"),
      where("created_by", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(tasksPerPage)
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      updateTasksFromSnapshot(querySnapshot);

      const newPageCache = new Map<
        number,
        QueryDocumentSnapshot<DocumentData>
      >();
      if (querySnapshot.docs.length > 0) {
        newPageCache.set(1, querySnapshot.docs[0]);
        setPageCache(newPageCache);
      }
    });
    return () => unsubscribe();
  }, [user]);

  const fetchNextPage = () => {
    if (currentPage >= totalPages || !lastDoc || !user || !user.uid) return;
    const q = query(
      collection(db, "tasks"),
      where("created_by", "==", user.uid),
      orderBy("createdAt", "desc"),
      startAfter(lastDoc),
      limit(tasksPerPage)
    );
    onSnapshot(q, (querySnapshot) => {
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
    });
  };

  const fetchPreviousPage = () => {
    if (currentPage <= 1 || !firstDoc || !user || !user.uid) return;
    const q = query(
      collection(db, "tasks"),
      where("created_by", "==", user.uid),
      orderBy("createdAt", "desc"),
      endBefore(firstDoc),
      limitToLast(tasksPerPage)
    );
    onSnapshot(q, (querySnapshot) => {
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
    });
  };

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
      createdAt: serverTimestamp(),
      created_by: user.uid,
    };
    await addDoc(collection(db, "tasks"), newTask);
  };

  const updateTaskStatus = async (
    taskId: string,
    newStatus: string
  ): Promise<void> => {
    await updateDoc(doc(db, "tasks", taskId), {
      status: newStatus,
    });
  };

  const deleteTask = async (taskId: string): Promise<void> => {
    await deleteDoc(doc(db, "tasks", taskId));
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
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
