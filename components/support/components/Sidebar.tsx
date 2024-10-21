import React from 'react';
import { Button } from "@/components/ui/button";
import Image from 'next/image';
import LogoutButton from '@/components/LogoutButton';
interface SidebarProps {
    activeView: 'leads' | 'realtors' | 'notifications';
    setActiveView: (view: 'leads' | 'realtors' | 'notifications') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
    return (
        <div className="w-64 bg-white shadow-md">
            <div className="p-4">
                <div className='flex mx-auto justify-center my-10'>
                    <Image src="/LeadLynx - logo.png" width={"120"} height={"120"} alt="Lead Lynx" />
                </div>
                <h2 className="text-2xl font-bold mb-6">Support Dashboard</h2>
                <nav>
                    <Button
                        variant={activeView === 'leads' ? 'default' : 'ghost'}
                        className="w-full justify-start mb-2"
                        onClick={() => setActiveView('leads')}
                    >
                        Accepted Leads
                    </Button>
                    <Button
                        variant={activeView === 'realtors' ? 'default' : 'ghost'}
                        className="w-full justify-start mb-2"
                        onClick={() => setActiveView('realtors')}
                    >
                        Realtor Management
                    </Button>
                    <Button
                        variant={activeView === 'notifications' ? 'default' : 'ghost'}
                        className="w-full justify-start"
                        onClick={() => setActiveView('notifications')}
                    >
                        Notifications
                    </Button>
                    <LogoutButton/>
                </nav>
            </div>
        </div>
    );
};