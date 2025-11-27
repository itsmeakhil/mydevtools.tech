"use client"

import { AddPasswordDialog } from "@/components/password-manager/add-password-dialog"
import { PasswordList } from "@/components/password-manager/password-list"
import { SecurityDashboard } from "@/components/password-manager/security-dashboard"
import { VaultLockScreen } from "@/components/password-manager/master-password-modal"
import { usePasswordStore } from "@/store/password-store"
import useAuth from "@/utils/useAuth"

export default function PasswordManagerPage() {
    const { user, loading } = useAuth(true);
    const { isUnlocked } = usePasswordStore()

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (!user) {
        return null;
    }

    if (!isUnlocked) {
        return <VaultLockScreen />
    }

    return (
        <div className="container mx-auto py-6 px-4 md:px-6 lg:px-8 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Password Manager</h1>
                <AddPasswordDialog />
            </div>

            <SecurityDashboard />
            <PasswordList />
        </div>
    )
}
