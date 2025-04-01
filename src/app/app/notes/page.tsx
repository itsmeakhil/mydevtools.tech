"use client";

import React, { Suspense } from "react";
import NotesContent from "./components/notes-content";

// This is the page component - it has no direct references to useSearchParams
// It only wraps the content component in a Suspense boundary
const Notes = () => {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
      </div>
    }>
      <NotesContent />
    </Suspense>
  );
};

export default Notes;
