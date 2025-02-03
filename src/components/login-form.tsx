"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Icons } from "../components/icons"

import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from "../database/firebase";

// import Image from 'next/image';



export function LoginForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState<boolean>(false)

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault()
    setIsLoading(true)

    setTimeout(() => {
      setIsLoading(false)
      router.push("/dashboard")
    }, 3000)
  }

//   const router = useRouter();
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      console.log('User signed in:', result.user);
      router.push('/dashboard'); // Redirect to the home page or any other page
      // Redirect or handle user data
    } catch (error) {
      console.error('Error during Google sign-in:', error);
    }
  };

  return (
    
    <div className="grid gap-6">
      <form onSubmit={onSubmit}>
        <div className="grid gap-4">
          <Button
          onClick={signInWithGoogle}
            variant="outline"
            type="button"
            disabled={isLoading}
            className="gap-2 bg-background hover:bg-accent transition-colors"
          >
            {isLoading ? <Icons.spinner className="mr-2 h-4 w-4 animate-spin" /> : <Icons.google className="h-4 w-4" />}{" "}
            Continue with Google
          </Button>
        </div>
      </form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>
      <div className="flex flex-col space-y-4 text-center text-sm">
        <p className="text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Button variant="link" className="p-0 text-foreground font-medium hover:text-foreground/80 transition-colors">
            Sign up
          </Button>
        </p>
      </div>
    </div>
  )
}

