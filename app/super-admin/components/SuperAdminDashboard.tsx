"use client";

import React, { useEffect, useState } from 'react';
import UserManagement from './UserManagement';
import LeadManagement from './LeadManagement';
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

const allowedRoles = ['super-admin'];


export default function SuperAdminDashboard() {
  const [activeTab, setActiveTab] = useState<'users' | 'leads'>('users');
  const { data: session, status } = useSession();
  const router = useRouter()
  // useEffect(() => {
  //   if (!session || !allowedRoles.includes(session.user.role)) {
  //     router.push('/unauthorized');
  //   }
  // }, [session, router]);
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-6">Super Admin</h1>
          <nav>
            <Button
              variant={activeTab === 'users' ? 'default' : 'ghost'}
              className="w-full justify-start mb-2"
              onClick={() => setActiveTab('users')}
            >
              User Management
            </Button>
            <Button
              variant={activeTab === 'leads' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('leads')}
            >
              Lead Management
            </Button>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-8 overflow-auto">
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'leads' && <LeadManagement />}
      </div>
    </div>
  );
}