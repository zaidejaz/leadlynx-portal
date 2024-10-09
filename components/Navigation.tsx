import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'
import { Button } from "@/components/ui/button"

export default function Navigation() {
  const { data: session } = useSession()

  return (
    <nav className="bg-background border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex-shrink-0 flex items-center">
              Real Estate Lead Management
            </Link>
          </div>
          <div className="flex items-center gap-3">
            {session ? (
              <>
                <Link href="/dashboard">
                  <Button >Dashboard</Button>
                </Link>
                <Button onClick={() => signOut()}>Sign out</Button>
              </>
            ) : (
              <Link href="/auth/signin">
                <Button>Sign in</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}