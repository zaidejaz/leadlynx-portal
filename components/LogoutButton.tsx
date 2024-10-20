'use client'

import { signOut } from 'next-auth/react'
import { Button } from "@/components/ui/button"
import { LogOut } from 'lucide-react'

export default function LogoutButton() {
  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' })
  }

  return (
    <Button
      variant="destructive"
      className="w-full justify-start my-2"
      onClick={handleLogout}
    >
      <LogOut className="mr-2 h-4 w-4" />
      Logout
    </Button>
  )
}