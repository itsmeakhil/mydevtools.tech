
"use client"

import { MasterPasswordModal } from "@/components/password-manager/master-password-modal"
import { PasswordList } from "@/components/password-manager/password-list"
import { AddPasswordDialog } from "@/components/password-manager/add-password-dialog"
import { usePasswordStore } from "@/store/password-store"
import { Lock } from "lucide-react"

export default function PasswordManagerPage() {
    const { isUnlocked } = usePasswordStore()

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Lock className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Password Manager</h1>
                        <p className="text-muted-foreground">Securely store and manage your passwords</p>
                    </div>
                </div>
                {isUnlocked && <AddPasswordDialog />}
            </div>

            <MasterPasswordModal />

            {isUnlocked ? (
                <PasswordList />
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                    <div className="p-4 bg-muted rounded-full">
                        <Lock className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <h2 className="text-xl font-semibold">Vault Locked</h2>
                    <p className="text-muted-foreground max-w-md">
                        Your password vault is currently locked. Please enter your Master Password to access your credentials.
                    </p>
                </div>
            )}
        </div>
    )
}
