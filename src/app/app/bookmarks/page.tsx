"use client"

import BookmarksManager from "@/components/bookmarks/bookmarks-manager";
import useAuth from "@/utils/useAuth";

export default function BookmarksPage() {
    const { user, loading } = useAuth(true);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse text-muted-foreground">Loading...</div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return <BookmarksManager />;
}
