import React from 'react'
import { Button } from "@/components/ui/button"
import LogoutButton from '@/components/LogoutButton';
import Image from "next/image"

interface SidebarProps {
  activeView: 'add' | 'view' | 'summary'
  setActiveView: (view: 'add' | 'view' | 'summary') => void
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
  return (
    <div className="w-64 bg-white shadow-md">
      <div className="p-4">
      <div className='flex mx-auto justify-center my-10'>
        <Image src="/LeadLynx - logo.png" width={"120"} height={"120"} alt="Lead Lynx"/>
        </div>
        <h2 className="text-2xl font-bold mb-6">Sales Dashboard</h2>
        <nav>
          <Button
            variant={activeView === 'add' ? 'default' : 'ghost'}
            className="w-full justify-start mb-2"
            onClick={() => setActiveView('add')}
          >
            Add Realtor
          </Button>
          <Button
            variant={activeView === 'view' ? 'default' : 'ghost'}
            className="w-full justify-start mb-2"
            onClick={() => setActiveView('view')}
          >
            View Realtors
          </Button>
          <Button
            variant={activeView === 'summary' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setActiveView('summary')}
          >
            Sales Summary
          </Button>
          <LogoutButton/>
        </nav>
      </div>
    </div>
  )
}