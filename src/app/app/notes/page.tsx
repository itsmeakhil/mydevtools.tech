"use client"

import NotionEditor from "@/components/notes/NotionEditor";
import useAuth from "@/utils/useAuth";

export default function NotesPage() {
    const { user, loading } = useAuth(true);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (!user) {
        return null;
    }

    return <NotionEditor />;
}
