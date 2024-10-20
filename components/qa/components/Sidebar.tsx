import React from 'react';
import { Button } from "@/components/ui/button";
import Image from "next/image"
import LogoutButton from '@/components/LogoutButton';
export const Sidebar: React.FC = () => {
  return (
    <div className="w-64 bg-white shadow-md">
      <div className="p-4">
        <div className='flex mx-auto justify-center my-10'>
        <Image src="/LeadLynx - logo.png" width={"120"} height={"120"} alt="Lead Lynx"/>
        </div>
        <h1 className="text-2xl font-bold mb-6">QA Dashboard</h1>
        <nav>
          <Button variant="default" className="w-full justify-start mb-2">
            Lead Management
          </Button>
          <LogoutButton/>
        </nav>
      </div>
    </div>
  );
};