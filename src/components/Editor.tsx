// components/Editor.tsx
"use client"; // Marks this as a Client Component

import "@blocknote/core/fonts/inter.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";

export default function Editor() {
  // Create a new editor instance
  const editor = useCreateBlockNote();

  // Render the editor instance
  return <BlockNoteView editor={editor} />;
}
