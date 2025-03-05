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
import { Wrench } from 'lucide-react'
import { sidebarData } from './data/sidebar-data'
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth'
import { auth } from '../../database/firebase'
import { useRouter } from 'next/navigation'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = useState({
    name: '',
    email: '',
    avatar: ''
  })

  const router = useRouter();
  
  const handleSignOut = async () => {
    try {
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
          <Wrench className="h-8 w-8 text-primary hover:scale-105 transition-transform duration-200" />
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-primary/90 drop-shadow-sm">MyDevTools</h2>
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
        <NavUser user={user} onSignout={handleSignOut}/>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
