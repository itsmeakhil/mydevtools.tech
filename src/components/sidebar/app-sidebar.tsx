'use client'
import { useEffect, useState } from 'react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import { NavGroup } from './nav-group'
import { NavUser } from './nav-user'
import { Logo } from '../logo'
import { sidebarData } from './data/sidebar-data'
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth'
import { auth } from '../../database/firebase'
import { useRouter } from 'next/navigation'
import { usePasswordStore } from '@/store/password-store'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { lockVault } = usePasswordStore()
  const [user, setUser] = useState({
    name: '',
    email: '',
    avatar: ''
  })

  const router = useRouter();

  // ...

  const handleSignOut = async () => {
    try {
      lockVault() // Clear in-memory state immediately

      // Clear encryption key from IndexedDB
      if (typeof window !== 'undefined' && window.indexedDB) {
        await new Promise<void>((resolve) => {
          const req = window.indexedDB.open("PasswordManagerDB", 1)
          req.onsuccess = (e: any) => {
            const db = e.target.result
            if (db.objectStoreNames.contains("keys")) {
              const tx = db.transaction("keys", "readwrite")
              tx.objectStore("keys").delete("vaultKey")
              tx.oncomplete = () => resolve()
              tx.onerror = () => resolve()
            } else {
              resolve()
            }
          }
          req.onerror = () => resolve()
        })
      }

      await firebaseSignOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser({
          name: user.displayName || '',
          email: user.email || '',
          avatar: user.photoURL || ''
        })
      }
    })

    return () => unsubscribe()
  }, [])

  return (
    <Sidebar collapsible='icon' variant='floating' {...props}>
      <SidebarHeader className="border-b border-border/40 pb-3">
        <div
          className="flex items-center space-x-3 px-3 py-2 transition-all duration-200 hover:cursor-pointer hover:bg-accent/50 rounded-md bg-accent/20"
          onClick={() => router.push('/dashboard')}
        >
          <div className="group-data-[state=collapsed]:hidden">
            <Logo size={32} showText={false} />
          </div>
          <div className="group-data-[state=collapsed]:hidden">
            <div className="relative h-6 w-28">
              {/* Light Mode Text (Dark Color) */}
              <img
                src="/logo-text-light.png"
                alt="MyDevTools"
                className="dark:hidden object-contain h-full w-full"
              />
              {/* Dark Mode Text (Light Color) */}
              <img
                src="/logo-text-dark.png"
                alt="MyDevTools"
                className="hidden dark:block object-contain h-full w-full"
              />
            </div>
            <p className="text-xs text-muted-foreground/70 font-medium tracking-wide">Developer&apos;s Toolkit</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {sidebarData.navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} onSignout={handleSignOut} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
