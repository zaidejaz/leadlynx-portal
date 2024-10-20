'use client'

import React, { useState, useEffect } from 'react'
import { getAcceptedLeads, getRealtors, assignLead, updateLeadStatus, getNotifications, updateRealtorInfo } from '../actions'
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Sidebar } from './Sidebar'
import { LeadTable } from './LeadTable'
import { RealtorTable } from './RealtorTable'
import { NotificationList } from './NotificationList'
import { Lead, Realtor, Notification } from '../types'

const allowedRoles = ['admin', 'support'];

export default function SupportDashboard() {
    const [leads, setLeads] = useState<Lead[]>([])
    const [realtors, setRealtors] = useState<Realtor[]>([])
    const [selectedRealtors, setSelectedRealtors] = useState<{ [key: string]: string | null }>({})
    const [activeView, setActiveView] = useState<'leads' | 'realtors' | 'notifications'>('leads')
    const [notifications, setNotifications] = useState<Notification[]>([])
    const { toast } = useToast()
    const { data: session, status } = useSession();
    const router = useRouter()

    useEffect(() => {
        if (status === 'loading') return;
        if (!session || !allowedRoles.includes(session.user.role)) {
            router.push('/');
        } else {
            fetchAcceptedLeads()
            fetchRealtors()
            fetchNotifications()
        }
    }, [session, status, router]);

    const fetchAcceptedLeads = async () => {
        try {
            const fetchedLeads = await getAcceptedLeads()
            setLeads(fetchedLeads)
        } catch (error) {
            console.error('Error fetching leads:', error)
            toast({
                title: "Error",
                description: "Failed to fetch leads. Please try again.",
                variant: "destructive",
            })
        }
    }

    const fetchRealtors = async () => {
        try {
            const fetchedRealtors = await getRealtors()
            setRealtors(fetchedRealtors)
        } catch (error) {
            console.error('Error fetching realtors:', error)
            toast({
                title: "Error",
                description: "Failed to fetch realtors. Please try again.",
                variant: "destructive",
            })
        }
    }

    const fetchNotifications = async () => {
        try {
            const fetchedNotifications = await getNotifications()
            setNotifications(fetchedNotifications)
        } catch (error) {
            console.error('Error fetching notifications:', error)
            toast({
                title: "Error",
                description: "Failed to fetch notifications. Please try again.",
                variant: "destructive",
            })
        }
    }

    const handleAssignLead = async (leadId: string, realtorId: string | null) => {
        if (!realtorId) {
            toast({
                title: "Error",
                description: "Please select a realtor before assigning.",
                variant: "destructive",
            })
            return
        }

        try {
            const result = await assignLead(leadId, realtorId)
            setLeads(prevLeads =>
                prevLeads.map(lead => {
                    if (lead.id === leadId) {
                        return {
                            ...lead,
                            assignments: [result, ...lead.assignments]
                        }
                    }
                    return lead
                })
            )
            setSelectedRealtors(prev => ({ ...prev, [leadId]: null }))
            toast({
                title: "Success",
                description: "Lead assigned successfully.",
            })
        } catch (error) {
            console.error('Error assigning lead:', error)
            toast({
                title: "Error",
                description: "Failed to assign lead. Please try again.",
                variant: "destructive",
            })
        }
    }

    const handleUpdateStatus = async (leadId: string, newStatus: string) => {
        try {
            await updateLeadStatus(leadId, newStatus)
            if (newStatus === 'Rejected-Overturned') {
                setLeads(prevLeads => prevLeads.filter(lead => lead.id !== leadId))
            } else {
                setLeads(prevLeads =>
                    prevLeads.map(lead => {
                        if (lead.id === leadId) {
                            return { ...lead, status: newStatus }
                        }
                        return lead
                    })
                )
            }
            toast({
                title: "Success",
                description: `Lead status updated to ${newStatus}.`,
            })
        } catch (error) {
            console.error('Error updating lead status:', error)
            toast({
                title: "Error",
                description: "Failed to update lead status. Please try again.",
                variant: "destructive",
            })
        }
    }

    const handleUpdateRealtorInfo = async (realtorId: string, field: string, value: boolean | string) => {
        try {
            await updateRealtorInfo(realtorId, field, value)
            setRealtors(prevRealtors =>
                prevRealtors.map(realtor =>
                    realtor.id === realtorId ? { ...realtor, [field]: value } : realtor
                )
            )
            toast({
                title: "Success",
                description: `Realtor ${field} updated successfully.`,
            })
        } catch (error) {
            console.error('Error updating realtor info:', error)
            toast({
                title: "Error",
                description: `Failed to update realtor ${field}. Please try again.`,
                variant: "destructive",
            })
        }
    }

    const getAvailableRealtors = (leadZipCode: string) => {
        return realtors.filter(realtor =>
            realtor.zipCodes.includes(leadZipCode) ||
            (realtor.centralZipCode === leadZipCode && realtor.radius > 0)
        )
    }

    if (!session || !allowedRoles.includes(session.user.role)) {
        return null;
    }

    return (
        <div className="flex h-screen bg-gray-100">
            <Toaster />
            <Sidebar activeView={activeView} setActiveView={setActiveView} />
            <div className="flex-1 p-8 overflow-auto">
                {activeView === 'leads' && (
                    <LeadTable
                        leads={leads}
                        selectedRealtors={selectedRealtors}
                        setSelectedRealtors={setSelectedRealtors}
                        getAvailableRealtors={getAvailableRealtors}
                        handleAssignLead={handleAssignLead}
                        handleUpdateStatus={handleUpdateStatus}
                    />
                )}
                {activeView === 'realtors' && (
                    <RealtorTable
                        realtors={realtors}
                        handleUpdateRealtorInfo={handleUpdateRealtorInfo}
                    />
                )}
                {activeView === 'notifications' && (
                    <NotificationList notifications={notifications} />
                )}
            </div>
        </div>
    )
}