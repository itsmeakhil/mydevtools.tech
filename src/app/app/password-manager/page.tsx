"use client"

import { AddPasswordDialog } from "@/components/password-manager/add-password-dialog"
import { PasswordList } from "@/components/password-manager/password-list"
import { VaultLockScreen } from "@/components/password-manager/master-password-modal"
import { usePasswordStore } from "@/store/password-store"

export default function PasswordManagerPage() {
    const { isUnlocked } = usePasswordStore()

    if (!isUnlocked) {
        return <VaultLockScreen />
    }

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Password Manager</h1>
                <AddPasswordDialog />
            </div>

            <PasswordList />
        </div>
    )
}
