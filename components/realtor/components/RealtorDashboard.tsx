// app/realtor/components/RealtorDashboard.tsx
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { getAssignedLeads, updateLeadStatus, addLeadComment, setCallbackTime } from '../actions'
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

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
  callbackTime: Date | null;
  comments: string | null;
}

export default function RealtorDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [leads, setLeads] = useState<Lead[]>([])
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [newStatus, setNewStatus] = useState<string>('')
  const [comment, setComment] = useState<string>('')
  const [callbackTime, setCallbackTime] = useState<string>('')
  const { toast } = useToast()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated' && session?.user?.role !== 'realtor') {
      router.push('/unauthorized')
    } else if (status === 'authenticated') {
      fetchLeads()
    }
  }, [status, session, router])

  const fetchLeads = async () => {
    try {
      const fetchedLeads = await getAssignedLeads()
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

  const handleStatusUpdate = async (assignmentId: string, newStatus: string) => {
    try {
      await updateLeadStatus(assignmentId, newStatus)
      toast({
        title: "Success",
        description: "Lead status updated successfully.",
      })
      await fetchLeads()
    } catch (error) {
      console.error('Error updating lead status:', error)
      toast({
        title: "Error",
        description: "Failed to update lead status. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleAddComment = async (assignmentId: string, comment: string) => {
    try {
      await addLeadComment(assignmentId, comment)
      toast({
        title: "Success",
        description: "Comment added successfully.",
      })
      setComment('')
      await fetchLeads()
    } catch (error) {
      console.error('Error adding comment:', error)
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSetCallbackTime = async (assignmentId: string, callbackTime: string) => {
    try {
      await setCallbackTime(assignmentId, new Date(callbackTime))
      toast({
        title: "Success",
        description: "Callback time set successfully.",
      })
      await fetchLeads()
    } catch (error) {
      console.error('Error setting callback time:', error)
      toast({
        title: "Error",
        description: "Failed to set callback time. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  if (!session || session.user.role !== 'realtor') {
    return null // The useEffect will redirect
  }

  return (
    <div className="container mx-auto p-4">
      <Toaster />
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
                <TableHead>Callback Time</TableHead>
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
                  <TableCell>{lead.callbackTime ? new Date(lead.callbackTime).toLocaleString() : 'Not set'}</TableCell>
                  <TableCell>{lead.comments || 'No comments'}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" onClick={() => setSelectedLead(lead)}>Update Status</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Update Lead Status</DialogTitle>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
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
                            <Textarea 
                              placeholder="Add a comment" 
                              value={comment}
                              onChange={(e) => setComment(e.target.value)}
                            />
                            <Button onClick={() => {
                              if (selectedLead) {
                                handleStatusUpdate(selectedLead.id, newStatus)
                                if (comment) {
                                  handleAddComment(selectedLead.id, comment)
                                }
                              }
                            }}>
                              Update Status
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" onClick={() => setSelectedLead(lead)}>Set Callback</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Set Callback Time</DialogTitle>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <Input
                              type="datetime-local"
                              value={callbackTime}
                              onChange={(e) => setCallbackTime(e.target.value)}
                              placeholder="Set callback time"
                            />
                            <Button onClick={() => {
                              if (selectedLead && callbackTime) {
                                handleSetCallbackTime(selectedLead.id, callbackTime)
                              }
                            }}>
                              Set Callback Time
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
      </Card>
    </div>
  )
}