'use client'

import { useState, useEffect } from 'react'
import { getLeads, updateLead } from '../actions'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast"

interface Lead {
  id: string;
  leadId: string;
  submissionDate: Date;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  emailAddress: string | null;
  propertyAddress: string;
  city: string;
  state: string;
  zipCode: string;
  isHomeOwner: boolean;
  propertyValue: number;
  hasRealtorContract: boolean;
  status: string;
  additionalNotes: string | null;
  submissionCount: number;
  recording: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const allowedRoles = ['admin', 'qa'];

function toTitleCase(str: string) {
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'pending': return 'bg-yellow-200 text-yellow-800';
    case 'accepted': return 'bg-green-200 text-green-800';
    case 'rejected': return 'bg-red-200 text-red-800';
    case 'no_coverage': return 'bg-orange-200 text-orange-800';
    default: return 'bg-blue-200 text-blue-800';
  }
}

export default function QADashboard() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([])
  const [editingLead, setEditingLead] = useState<Lead | null>(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const { data: session, status } = useSession();
  const router = useRouter()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || !allowedRoles.includes(session.user.role)) {
      router.push('/unauthorized');
    } else {
      fetchLeads();
    }
  }, [session, status, router]);

  useEffect(() => {
    filterLeads()
  }, [leads, statusFilter, dateFilter, searchTerm])

  const fetchLeads = async () => {
    try {
      const fetchedLeads = await getLeads()
      setLeads(fetchedLeads)
    } catch (error) {
      console.error('Error fetching leads:', error)
      // You might want to show an error message to the user here
    }
  }

  const filterLeads = () => {
    let result = leads

    if (statusFilter && statusFilter !== 'all') {
      result = result.filter(lead => lead.status === statusFilter)
    }

    if (dateFilter) {
      result = result.filter(lead => {
        const leadDate = new Date(lead.submissionDate)
        const filterDate = new Date(dateFilter)
        return (
          leadDate.getFullYear() === filterDate.getFullYear() &&
          leadDate.getMonth() === filterDate.getMonth() &&
          leadDate.getDate() === filterDate.getDate()
        )
      })
    }

    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase()
      result = result.filter(lead =>
        Object.values(lead).some(value => 
          value && value.toString().toLowerCase().includes(lowercasedTerm)
        )
      )
    }

    setFilteredLeads(result)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (editingLead) {
      const { name, value } = e.target
      setEditingLead(prev => {
        if (prev) {
          return {
            ...prev,
            [name]: name === 'isHomeOwner' || name === 'hasRealtorContract'
              ? value === 'true'
              : name === 'propertyValue'
                ? parseFloat(value)
                : value
          }
        }
        return null
      })
    }
  }

  const handleUpdate = async () => {
    if (editingLead) {
      const result = await updateLead(editingLead)
      if (result.success) {
        toast({
          title: "Success",
          description: "Lead updated successfully",
        })
        fetchLeads()
        setEditingLead(null)
        setIsDialogOpen(false)
      } else {
        toast({
          title: "Error",
          description: "Failed to update lead. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  if (!session || !allowedRoles.includes(session.user.role)) {
    return null; // The useEffect will redirect to the unauthorized page
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-6">QA Dashboard</h1>
          <nav>
            <Button
              variant={"default"}
              className="w-full justify-start mb-2"
            >
              Lead Management
            </Button>
          </nav>
        </div>
      </div>

      <div className="flex-1 p-8 overflow-auto">
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent className="flex space-x-4">
          <div className="mb-4 flex space-x-4">
                                <Input
                                    type="date"
                                    value={dateFilter}
                                    onChange={(e) => setDateFilter(e.target.value)}
                                />
                                <Select
                                    value={statusFilter}
                                    onValueChange={(value) => setStatusFilter(value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="accepted">Accepted</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                        <SelectItem value="no_coverage">No Coverage</SelectItem>
                                        <SelectItem value="rejected_overturned">Rejected Overturned</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search..."
                                />
                            </div>
          </CardContent>
        </Card>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Lead ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Home Owner</TableHead>
              <TableHead>Property Value</TableHead>
              <TableHead>Realtor Contract</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submission Date</TableHead>
              <TableHead>Recording</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLeads.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell>{lead.leadId}</TableCell>
                <TableCell>{`${lead.firstName} ${lead.lastName}`}</TableCell>
                <TableCell>{lead.phoneNumber}</TableCell>
                <TableCell>{lead.emailAddress}</TableCell>
                <TableCell>{`${lead.propertyAddress}, ${lead.city}, ${lead.state} ${lead.zipCode}`}</TableCell>
                <TableCell>{lead.isHomeOwner ? 'Yes' : 'No'}</TableCell>
                <TableCell>${lead.propertyValue.toLocaleString()}</TableCell>
                <TableCell>{lead.hasRealtorContract ? 'Yes' : 'No'}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded ${getStatusColor(lead.status)}`}>
                    {toTitleCase(lead.status)}
                  </span>
                </TableCell>
                <TableCell>{new Date(lead.submissionDate).toLocaleString()}</TableCell>
                <TableCell>
                  {lead.recording ? (
                    <a href={lead.recording} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      View Recording
                    </a>
                  ) : (
                    <span className="text-gray-500">No recording</span>
                  )}
                </TableCell>
                <TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" onClick={() => setEditingLead({ ...lead })}>Update</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Edit Lead</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="firstName" className="text-right">First Name</Label>
                          <Input id="firstName" name="firstName" value={editingLead?.firstName} onChange={handleInputChange} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="lastName" className="text-right">Last Name</Label>
                          <Input id="lastName" name="lastName" value={editingLead?.lastName} onChange={handleInputChange} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="phoneNumber" className="text-right">Phone Number</Label>
                          <Input id="phoneNumber" name="phoneNumber" value={editingLead?.phoneNumber} onChange={handleInputChange} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="emailAddress" className="text-right">Email Address</Label>
                          <Input id="emailAddress" name="emailAddress" value={editingLead?.emailAddress || ''} onChange={handleInputChange} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="propertyAddress" className="text-right">Property Address</Label>
                          <Input id="propertyAddress" name="propertyAddress" value={editingLead?.propertyAddress} onChange={handleInputChange} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="city" className="text-right">City</Label>
                          <Input id="city" name="city" value={editingLead?.city} onChange={handleInputChange} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="state" className="text-right">State</Label>
                          <Input id="state" name="state" value={editingLead?.state} onChange={handleInputChange} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="zipCode" className="text-right">Zip Code</Label>
                          <Input id="zipCode" name="zipCode" value={editingLead?.zipCode} onChange={handleInputChange} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="isHomeOwner" className="text-right">Home Owner</Label>
                          <Select name="isHomeOwner" onValueChange={(value) => handleInputChange({ target: { name: 'isHomeOwner', value } } as any)} value={editingLead?.isHomeOwner.toString()}>
                            <SelectTrigger className="col-span-3">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="true">Yes</SelectItem>
                              <SelectItem value="false">No</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="propertyValue" className="text-right">Property Value</Label>
                          <Input id="propertyValue" name="propertyValue" type="number" value={editingLead?.propertyValue} onChange={handleInputChange} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="hasRealtorContract" className="text-right">Realtor Contract</Label>
                          <Select name="hasRealtorContract" onValueChange={(value) => handleInputChange({ target: { name: 'hasRealtorContract', value } } as any)} value={editingLead?.hasRealtorContract.toString()}>
                            <SelectTrigger className="col-span-3">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="true">Yes</SelectItem>
                              <SelectItem value="false">No</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="status" className="text-right">Status</Label>
                          <Select name="status" onValueChange={(value) => handleInputChange({ target: { name: 'status', value } } as any)} value={editingLead?.status}>
                            <SelectTrigger className="col-span-3">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="accepted">Accepted</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                              <SelectItem value="no_coverage">No Coverage</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="recording" className="text-right">Recording URL</Label>
                          <Input id="recording" name="recording" value={editingLead?.recording || ''} onChange={handleInputChange} className="col-span-3" />
                        </div>
                      </div>
                      <Button onClick={handleUpdate}>Save changes</Button>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}