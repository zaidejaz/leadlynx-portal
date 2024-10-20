"use client";
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { createLead, getLeads } from '../../leadgen/actions';
import { useToast } from "@/hooks/use-toast";
import { Lead, Realtor } from '@prisma/client';
import { Sidebar } from './Sidebar';
import { LeadForm } from '../../leadgen/components/LeadForm';
import { LeadGenReporting } from '../../leadgen/components/LeadGenReporting';
import { LeadTable } from '@/components/qa/components/LeadTable';
import { updateLead } from '@/components/qa/actions';
import { RealtorTable } from '@/components/support/components/RealtorTable';
import { LeadQA } from '@/components/qa/types';
import { LeadFilters } from '@/components/qa/components/LeadFilters';
import { Pagination } from '@/components/ui/pagination';
import { SalesSummary } from '@/components/sales/components/SalesSummary';
import { getAllSalesSummary } from '../actions';
import { updateRealtorInfo, getRealtors } from "@/components/support/actions"
import AddUserForm from './AddUserForm';
import ManageUsers from './ManageUsers';
import { NotificationList } from '@/components/support/components/NotificationList';
import { getNotifications } from '@/components/support/actions';

const allowedRoles = ['admin'];
const LEADS_PER_PAGE = 100;

type AdminView = 'add-user' | 'manage-users' | 'add-lead' | 'view-leads' | 'lead-report' | 'add-realtor' | 'view-realtors' | 'all-sales-summary' | 'notifications';

export default function SuperAdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [activeView, setActiveView] = useState<AdminView>('add-user');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [realtors, setRealtors] = useState<Realtor[]>([]);
  const [allSalesSummary, setAllSalesSummary] = useState<any>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingLead, setEditingLead] = useState<LeadQA | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || !allowedRoles.includes(session.user.role)) {
      // router.push('/');
      fetchData();

    } else {
      fetchData();
    }
  }, [session, status, router, activeView, currentPage]);

  useEffect(() => {
    if (activeView === 'view-leads') {
      filterLeads();
    }
  }, [leads, statusFilter, dateFilter, searchTerm]);

  const fetchData = async () => {
    switch (activeView) {
      case 'view-leads':
        await fetchLeads();
        break;
      case 'view-realtors':
        await fetchRealtors();
        break;
      case 'all-sales-summary':
        await fetchAllSalesSummary();
        break;
      case 'notifications':
        await fetchNotifications();
        break;
    }
  };

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

  const fetchRealtors = async () => {
    try {
      const fetchedRealtors = await getRealtors();
      setRealtors(fetchedRealtors);
    } catch (error) {
      console.error('Error fetching realtors:', error);
      toast({
        title: "Error",
        description: "Failed to fetch realtors. Please try again.",
        variant: "destructive",
      });
    }
  };

  const fetchAllSalesSummary = async () => {
    try {
      const summary = await getAllSalesSummary(null, null);
      setAllSalesSummary(summary);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch all sales summary. Please try again.",
        variant: "destructive",
      });
    }
  };

  const fetchNotifications = async () => {
    try {
      const fetchedNotifications = await getNotifications();
      setNotifications(fetchedNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: "Error",
        description: "Failed to fetch notifications. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCreateLead = async (formData: FormData) => {
    const result = await createLead(formData);
    if (result.success) {
      toast({
        title: "Success",
        description: `Lead created successfully with ID: ${result.leadId}`,
      });
      if (activeView === 'view-leads') {
        fetchLeads();
      }
    } else {
      toast({
        title: "Error",
        description: "Failed to create lead. Please try again.",
        variant: "destructive",
      });
    }
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
          toast({
            title: "Success",
            description: "Lead updated successfully",
          });
          fetchLeads();
          setEditingLead(null);
        } else {
          toast({
            title: "Error",
            description: "Failed to update lead. Please try again.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error updating lead:', error);
        toast({
          title: "Error",
          description: "An error occurred while updating the lead.",
          variant: "destructive",
        });
      }
    }
  };

  const handleUpdateRealtorInfo = async (realtorId: string, field: string, value: boolean | string) => {
    try {
      await updateRealtorInfo(realtorId, field, value);
      setRealtors(prevRealtors =>
        prevRealtors.map(realtor =>
          realtor.id === realtorId ? { ...realtor, [field]: value } : realtor
        )
      );
      toast({
        title: "Success",
        description: `Realtor ${field} updated successfully.`,
      });
    } catch (error) {
      console.error('Error updating realtor info:', error);
      toast({
        title: "Error",
        description: `Failed to update realtor ${field}. Please try again.`,
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
        {activeView === 'add-user' && <AddUserForm />}
        {activeView === 'manage-users' && <ManageUsers />}
        {activeView === 'add-lead' && <LeadForm onSubmit={handleCreateLead} />}
        {activeView === 'view-leads' && (
          <>
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
          </>
        )}
        {activeView === 'lead-report' && <LeadGenReporting />}
        {activeView === 'view-realtors' && (
          <RealtorTable
            realtors={realtors}
            handleUpdateRealtorInfo={handleUpdateRealtorInfo}
          />
        )}
        {activeView === 'all-sales-summary' && (
          <SalesSummary
            salesSummary={allSalesSummary}
            onDateChange={fetchAllSalesSummary}
          />
        )}
        {activeView === 'notifications' && (
          <NotificationList notifications={notifications}/>
        )}
      </div>
    </div>
  );
}