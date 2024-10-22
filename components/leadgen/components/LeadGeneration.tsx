"use client";
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { createLead, getLeads, importLeads, exportLeads } from '../actions';
import { useToast } from "@/hooks/use-toast";
import { Sidebar } from './Sidebar';
import { LeadForm } from './LeadForm';
import { LeadTable } from './LeadTable';
import { LeadFilters } from './LeadFilters';
import { LeadGenReporting } from './LeadGenReporting';
import { Lead } from '@prisma/client';

const allowedRoles = ['admin', 'leadgen'];
const LEADS_PER_PAGE = 100;

export default function LeadGeneration() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { toast } = useToast();
    const [activeView, setActiveView] = useState<'add' | 'view' | 'report'>('add');
    const [leads, setLeads] = useState<Lead[]>([]);
    const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
    const [dateFilter, setDateFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        if (status === 'loading') return;
        if (!session || !allowedRoles.includes(session.user.role)) {
            router.push('/unauthorized');
        } else {
            fetchLeads();
        }
    }, [session, status, router]);

    useEffect(() => {
        filterLeads();
    }, [leads, dateFilter, statusFilter, searchTerm]);

    const fetchLeads = async () => {
        const result = await getLeads(currentPage, LEADS_PER_PAGE);
        if (result.success) {
            setLeads(result.leads);
            setTotalPages(Math.ceil(result.totalCount / LEADS_PER_PAGE));
        } else {
            toast({
                title: "Error",
                description: "Failed to fetch leads. Please try again.",
                variant: "destructive",
            });
        }
    };

    const handlePageChange = async (page: number) => {
        try {
            const result = await getLeads(page, LEADS_PER_PAGE);
            if (result.success) {
                setLeads(result.leads);
                setCurrentPage(page);
                setTotalPages(result.totalPages);
            }
        } catch (error) {
            console.error('Error changing page:', error);
            toast.error("Failed to load page");
        }
    };

    const handleImportCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const formData = new FormData();
            formData.append('file', file);
            const result = await importLeads(formData);
            if (result.success) {
                toast({
                    title: "Success",
                    description: "Leads imported successfully.",
                });
                fetchLeads();
            } else {
                toast({
                    title: "Error",
                    description: "Failed to import leads. Please try again.",
                    variant: "destructive",
                });
            }
        }
    };

    const handleExportCSV = async () => {
        const result = await exportLeads();
        if (result.success) {
            const blob = new Blob([result.csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", "leads.csv");
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast({
                title: "Success",
                description: "Leads exported successfully.",
            });
        } else {
            toast({
                title: "Error",
                description: "Failed to export leads. Please try again.",
                variant: "destructive",
            });
        }
    };

    const filterLeads = () => {
        let result = leads;

        if (dateFilter) {
            result = result.filter(lead =>
                new Date(lead.submissionDate).toISOString().split('T')[0] === dateFilter
            );
        }

        if (statusFilter !== 'all') {
            result = result.filter(lead => lead.status.toLowerCase() === statusFilter.toLowerCase());
        }

        if (searchTerm) {
            const lowercasedTerm = searchTerm.toLowerCase();
            result = result.filter(lead =>
                Object.values(lead).some(value =>
                    value && value.toString().toLowerCase().includes(lowercasedTerm)
                )
            );
        }

        setFilteredLeads(result);
    };


    function toTitleCase(str: string) {
        return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
    }

    function getStatusColor(status: string) {
        switch (status.toLowerCase()) {
            case 'pending': return 'bg-yellow-200 text-yellow-800';
            case 'accepted': return 'bg-green-200 text-green-800';
            case 'rejected': return 'bg-red-200 text-red-800';
            case 'no_coverage': return 'bg-gray-200 text-gray-800';
            case 'rejected_overturned': return 'bg-orange-200 text-gray-800'
            default: return 'bg-blue-200 text-blue-800';
        }
    }

    const handleCreateLead = async (formData: FormData) => {
        const result = await createLead(formData);
        if (result.success) {
            toast({
                title: "Success",
                description: `Lead created successfully with ID: ${result.leadId}`,
            });
            fetchLeads();
        } else {
            toast({
                title: "Error",
                description: "Failed to create lead. Please try again.",
                variant: "destructive",
            });
        }
    };


    if (!session || !allowedRoles.includes(session.user.role)) {
        return null;
    }

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar activeView={activeView} onViewChange={setActiveView} />
            <div className="flex-1 p-8 overflow-auto">
                {activeView === 'add' && <LeadForm onSubmit={handleCreateLead} />}
                {activeView === 'view' && (
                    <>
                        <LeadFilters
                            dateFilter={dateFilter}
                            statusFilter={statusFilter}
                            searchTerm={searchTerm}
                            onDateFilterChange={setDateFilter}
                            onStatusFilterChange={setStatusFilter}
                            onSearchTermChange={setSearchTerm}
                            onImportCSV={handleImportCSV}
                            onExportCSV={handleExportCSV}
                        />
                        <LeadTable
                            leads={leads}
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    </>
                )}
                {activeView === 'report' && <LeadGenReporting />}
            </div>
        </div>
    );
}