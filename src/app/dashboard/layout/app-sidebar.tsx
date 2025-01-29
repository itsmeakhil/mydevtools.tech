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
import { TeamSwitcher } from './team-switcher'
import { sidebarData } from './data/sidebar-data'
import { onAuthStateChanged,signOut as firebaseSignOut } from 'firebase/auth'
import { auth } from '../../app/to-do/database/firebase'
import { useRouter } from 'next/navigation'; // Ensure you have initialized Firebase in this file
import { ModeToggle } from "../../../components/modeToggle"

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
      <SidebarHeader>
        <div className="flex items-center justify-between w-full">
          <TeamSwitcher teams={sidebarData.teams} />
          <ModeToggle />
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
