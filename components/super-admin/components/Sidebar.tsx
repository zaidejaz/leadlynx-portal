import React from 'react';
import { Button } from "@/components/ui/button";
import Image from 'next/image';
import LogoutButton from '@/components/LogoutButton';

type AdminView = 'add-user' | 'manage-users' | 'add-lead' | 'view-leads' | 'lead-report' | 'add-realtor' | 'view-realtors' | 'all-sales-summary' | 'notifications' | 'payments';

interface SidebarProps {
  activeView: AdminView;
  onViewChange: (view: AdminView) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange }) => {
  return (
    <div className="w-64 bg-white shadow-md">
      <div className="p-4">
        <div className='flex mx-auto justify-center my-10'>
          <Image src="/LeadLynx - logo.png" width={"120"} height={"120"} alt="Lead Lynx" />
        </div>
        <h2 className="text-2xl font-bold mb-6">Admin Dashboard</h2>
        <nav className="space-y-2">
          <Button
            variant={activeView === 'add-user' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => onViewChange('add-user')}
          >
            Add User
          </Button>
          <Button
            variant={activeView === 'manage-users' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => onViewChange('manage-users')}
          >
            Manage Users
          </Button>

          <Button
            variant={activeView === 'add-lead' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => onViewChange('add-lead')}
          >
            Add Lead
          </Button>
          <Button
            variant={activeView === 'view-leads' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => onViewChange('view-leads')}
          >
            View Leads
          </Button>
          <Button
            variant={activeView === 'lead-report' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => onViewChange('lead-report')}
          >
            Lead Report
          </Button>
          <Button
            variant={activeView === 'view-realtors' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => onViewChange('view-realtors')}
          >
            View Realtors
          </Button>
          <Button
            variant={activeView === 'all-sales-summary' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => onViewChange('all-sales-summary')}
          >
            All Sales Summary
          </Button>
          <Button
            variant={activeView === 'notifications' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => onViewChange('notifications')}
          >
            Notifications
          </Button>
          <Button
            variant={activeView === 'payments' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => onViewChange('payments')}
          >
            Payment
          </Button>
          <LogoutButton />
        </nav>
      </div>
    </div>
  );
};