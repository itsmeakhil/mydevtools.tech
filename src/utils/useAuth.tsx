// hooks/useAuth.js
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from "../app/app/to-do/database/firebase";
import { User } from 'firebase/auth';
// import { setPersistence, browserSessionPersistence } from 'firebase/auth';

const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    // const setAuthPersistence = async () => {
    //   try {
    //     await setPersistence(auth, browserSessionPersistence);
    //   } catch (error) {
    //     console.error('Error setting persistence:', error);
    //   }
    // };

    if (typeof window !== 'undefined') {
      // setAuthPersistence();

      const unsubscribe = auth.onAuthStateChanged((user) => {
        if (user) {
          setUser(user);
        } else {
          setUser(null);
          router.push('/login'); // Redirect to the login page
        }
      });

      return () => unsubscribe();
    }
  }, [router]);

  return user;
};

export default useAuth;

