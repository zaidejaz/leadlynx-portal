import React from 'react';
import { Button } from "@/components/ui/button";
import LogoutButton from '@/components/LogoutButton';
import Image from "next/image"

interface SidebarProps {
  activeView: 'add' | 'view' | 'report';
  onViewChange: (view: 'add' | 'view' | 'report') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange }) => {
  return (
    <div className="w-64 bg-white shadow-md">
      <div className="p-4">
        <div className='flex mx-auto justify-center my-10'>
        <Image src="/LeadLynx - logo.png" width={"120"} height={"120"} alt="Lead Lynx"/>
        </div>
        <h2 className="text-2xl font-bold mb-6">Lead Generation</h2>
        <nav>
          <Button
            variant={activeView === 'add' ? 'default' : 'ghost'}
            className="w-full justify-start mb-2"
            onClick={() => onViewChange('add')}
          >
            Add Lead
          </Button>
          <Button
            variant={activeView === 'view' ? 'default' : 'ghost'}
            className="w-full justify-start mb-2"
            onClick={() => onViewChange('view')}
          >
            View Leads
          </Button>
          <Button
            variant={activeView === 'report' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => onViewChange('report')}
          >
            Reporting
          </Button>
          <LogoutButton/>
        </nav>
      </div>
    </div>
  );
};