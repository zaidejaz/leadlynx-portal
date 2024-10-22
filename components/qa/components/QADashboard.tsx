'use client'

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { getLeads, updateLead } from '../actions';
import { toast } from "sonner";
import { Pagination } from "@/components/ui/pagination";
import { LeadFilters } from './LeadFilters';
import { LeadTable } from './LeadTable';
import { Sidebar } from './Sidebar';
import { LeadQA } from '../types';

const allowedRoles = ['admin', 'qa'];
const LEADS_PER_PAGE = 100;

export default function QADashboard() {
  const [leads, setLeads] = useState<LeadQA[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<LeadQA[]>([]);
  const [editingLead, setEditingLead] = useState<LeadQA | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || !allowedRoles.includes(session.user.role)) {
      router.push('/unauthorized');
    } else {
      fetchLeads();
    }
  }, [session, status, router, currentPage]);

  useEffect(() => {
    filterLeads();
  }, [leads, statusFilter, dateFilter, searchTerm]);

  const fetchLeads = async () => {
    try {
      const result = await getLeads(currentPage, LEADS_PER_PAGE);
      if (result.success) {
        setLeads(result.leads);
        setTotalPages(Math.ceil(result.totalCount / LEADS_PER_PAGE));
      } else {
        toast.error("Failed to fetch leads. Please try again.");
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast.error("An error occurred while fetching leads.");
    }
  };

  const filterLeads = () => {
    let result = leads;

    if (statusFilter && statusFilter !== 'all') {
      result = result.filter(lead => lead.status === statusFilter);
    }

    if (dateFilter) {
      result = result.filter(lead => {
        const leadDate = new Date(lead.submissionDate);
        const filterDate = new Date(dateFilter);
        return (
          leadDate.getFullYear() === filterDate.getFullYear() &&
          leadDate.getMonth() === filterDate.getMonth() &&
          leadDate.getDate() === filterDate.getDate()
        );
      });
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditingLead(prev => {
      if (prev) {
        return {
          ...prev,
          [name]: name === 'isHomeOwner' || name === 'hasRealtorContract'
            ? value === 'true'
            : name === 'propertyValue'
              ? parseFloat(value)
              : value
        };
      }
      return null;
    });
  };

  const handleUpdate = async () => {
    if (editingLead) {
      try {
        const result = await updateLead(editingLead);
        if (result.success) {
          toast.success("Lead updated successfully");
          fetchLeads();
          setEditingLead(null);
        } else {
          toast.error("Failed to update lead. Please try again.");
        }
      } catch (error) {
        console.error('Error updating lead:', error);
        toast.error("An error occurred while updating the lead.");
      }
    }
  };

  if (!session || !allowedRoles.includes(session.user.role)) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-8 overflow-auto">
        <LeadFilters
          dateFilter={dateFilter}
          statusFilter={statusFilter}
          searchTerm={searchTerm}
          onDateFilterChange={setDateFilter}
          onStatusFilterChange={setStatusFilter}
          onSearchTermChange={setSearchTerm}
        />
        <LeadTable 
          leads={filteredLeads} 
          onEditLead={setEditingLead}
          editingLead={editingLead}
          onInputChange={handleInputChange}
          onUpdate={handleUpdate}
        />
        <div className="mt-4">
          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
}