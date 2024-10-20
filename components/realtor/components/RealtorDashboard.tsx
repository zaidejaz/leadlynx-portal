'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { getAssignedLeads, updateLeadStatus, addLeadComment, getRealtorStatus, updateRealtorInfo } from '../actions'
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Sidebar } from './Sidebar'
import { ReferralAgreement } from './ReferralAgreement'

interface Lead {
  id: string;
  leadId: string;
  prospectName: string;
  prospectContact: string;
  propertyAddress: string;
  bedrooms: number | null;
  bathrooms: number | null;
  underAgentContract: boolean;
  status: string;
  comments: string | null;
  canChangeStatus: boolean;
}

export default function RealtorDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [leads, setLeads] = useState<Lead[]>([])
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [newStatus, setNewStatus] = useState<string>('')
  const [comment, setComment] = useState<string>('')
  const [realtorStatus, setRealtorStatus] = useState<{ isActive: boolean; signUpCategory: string; contractSent: boolean }>({ isActive: false, signUpCategory: '', contractSent: false })
  const [activeView, setActiveView] = useState<'assigned-leads'>('assigned-leads');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated' && session?.user?.role !== 'realtor') {
      router.push('/unauthorized')
    } else if (status === 'authenticated') {
      fetchRealtorStatus()
      fetchLeads()
    }
  }, [status, session, router])

  const fetchRealtorStatus = async () => {
    try {
      const status = await getRealtorStatus()
      setRealtorStatus(status)
    } catch (error) {
      console.error('Error fetching realtor status:', error)
      toast.error("Failed to fetch realtor status. Please try again.")
    }
  }

  const fetchLeads = async () => {
    try {
      const fetchedLeads = await getAssignedLeads()
      setLeads(fetchedLeads)
    } catch (error) {
      console.error('Error fetching leads:', error)
      toast.error("Failed to fetch leads. Please try again.")
    }
  }

  const handleStatusUpdate = async (assignmentId: string, newStatus: string) => {
    try {
      await updateLeadStatus(assignmentId, newStatus)
      toast.success("Lead status updated successfully.")
      await fetchLeads()
    } catch (error) {
      console.error('Error updating lead status:', error)
      toast.error("Failed to update lead status. Please try again.")
    }
  }

  const handleAddComment = async (assignmentId: string, comment: string) => {
    try {
      await addLeadComment(assignmentId, comment)
      toast.success("Comment added successfully.")
      setComment('')
      await fetchLeads()
    } catch (error) {
      console.error('Error adding comment:', error)
      toast.error("Failed to add comment. Please try again.")
    }
  }

  const handleContractSent = async () => {
    try {
      const result = await updateRealtorInfo('contractSent', true);
      if (result.success) {
        setRealtorStatus(prev => ({ ...prev, contractSent: true }));
        toast.success("Contract status updated successfully.");
      } else {
        throw new Error(result.error || 'Failed to update contract status');
      }
    } catch (error) {
      console.error('Error updating contract status:', error);
      toast.error("Failed to update contract status. Please try again.");
    }
  };

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  if (!session || session.user.role !== 'realtor') {
    return null
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      <div className="flex-1 p-8 overflow-auto">
        {(!realtorStatus.isActive) ? (
          <ReferralAgreement
            signUpCategory={realtorStatus.signUpCategory}
            initialContractSent={realtorStatus.contractSent}
            onContractSent={handleContractSent}
          />) : (
          <Card>
            <CardHeader>
              <CardTitle>Your Assigned Leads</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Prospect Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Beds</TableHead>
                    <TableHead>Baths</TableHead>
                    <TableHead>Agent Contract</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Comments</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell>{lead.prospectName}</TableCell>
                      <TableCell>{lead.prospectContact}</TableCell>
                      <TableCell>{lead.propertyAddress}</TableCell>
                      <TableCell>{lead.bedrooms ?? 'N/A'}</TableCell>
                      <TableCell>{lead.bathrooms ?? 'N/A'}</TableCell>
                      <TableCell>{lead.underAgentContract ? 'Yes' : 'No'}</TableCell>
                      <TableCell>{lead.status}</TableCell>
                      <TableCell>{lead.comments || 'No comments'}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" onClick={() => setSelectedLead(lead)}>
                                {lead.canChangeStatus ? 'Update Status' : 'Add Comment'}
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                              <DialogHeader>
                                <DialogTitle>{lead.canChangeStatus ? 'Update Lead Status' : 'Add Comment'}</DialogTitle>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                {lead.canChangeStatus && (
                                  <Select onValueChange={setNewStatus}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select new status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Listing Agreement Signed">Listing Agreement Signed</SelectItem>
                                      <SelectItem value="Not interested in selling">Not interested in selling</SelectItem>
                                      <SelectItem value="Resulted in not listing">Resulted in not listing</SelectItem>
                                      <SelectItem value="Listed by Homeowner">Listed by Homeowner</SelectItem>
                                      <SelectItem value="Follow up needed">Follow up needed</SelectItem>
                                      <SelectItem value="Appointment scheduled">Appointment scheduled</SelectItem>
                                    </SelectContent>
                                  </Select>
                                )}
                                <Textarea
                                  placeholder="Add a comment"
                                  value={comment}
                                  onChange={(e) => setComment(e.target.value)}
                                />
                                <Button onClick={() => {
                                  if (selectedLead) {
                                    if (lead.canChangeStatus && newStatus) {
                                      handleStatusUpdate(selectedLead.id, newStatus)
                                    }
                                    if (comment) {
                                      handleAddComment(selectedLead.id, comment)
                                    }
                                  }
                                }}>
                                  {lead.canChangeStatus ? 'Update Status and Comment' : 'Add Comment'}
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>)}
      </div>
    </div>
  )
}