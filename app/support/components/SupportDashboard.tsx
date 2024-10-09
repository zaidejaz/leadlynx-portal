'use client'

import { useState, useEffect } from 'react'
import { getAcceptedLeads, getRealtors, assignLead } from '../actions'
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface Lead {
    id: string;
    leadId: string;
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
    submissionDate: string;
    assignments: LeadAssignment[];
}

interface Realtor {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    agentCode: string;
    brokerage: string;
    state: string;
}

interface LeadAssignment {
    id: string;
    agentCode: string;
    realtorFirstName: string;
    realtorLastName: string;
    dateSent: string;
    leadId: string;
}

const allowedRoles = ['admin', 'support'];

export default function SupportDashboard() {
    const [leads, setLeads] = useState<Lead[]>([])
    const [realtors, setRealtors] = useState<Realtor[]>([])
    const [selectedRealtors, setSelectedRealtors] = useState<{ [key: string]: string | null }>({})
    const [activeView, setActiveView] = useState<'leads' | 'realtors'>('leads')
    const { toast } = useToast()

    const { data: session, status } = useSession();
    const router = useRouter()

    useEffect(() => {
        if (status === 'loading') return;
        if (!session || !allowedRoles.includes(session.user.role)) {
            router.push('/unauthorized');
        } else {
            fetchAcceptedLeads()
            fetchRealtors()
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

    if (!session || !allowedRoles.includes(session.user.role)) {
        return null;
    }

    return (
        <div className="flex h-screen bg-gray-100">
            <Toaster />
            {/* Sidebar */}
            <div className="w-64 bg-white shadow-md">
                <div className="p-4">
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
                            className="w-full justify-start"
                            onClick={() => setActiveView('realtors')}
                        >
                            Realtor Management
                        </Button>
                    </nav>
                </div>
            </div>

            {/* Main content */}
            <div className="flex-1 p-8 overflow-auto">
                {activeView === 'leads' ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>Accepted Leads</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Lead ID</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Assignments</TableHead>
                                        <TableHead>Assign To</TableHead>
                                        <TableHead>Details</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {leads.map((lead) => (
                                        <TableRow key={lead.id}>
                                            <TableCell>{lead.leadId}</TableCell>
                                            <TableCell>{`${lead.firstName} ${lead.lastName}`}</TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">
                                                    {lead.assignments.length}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    <Select
                                                        value={selectedRealtors[lead.id] || ""}
                                                        onValueChange={(value) => setSelectedRealtors(prev => ({ ...prev, [lead.id]: value }))}
                                                    >
                                                        <SelectTrigger className="w-[180px]">
                                                            <SelectValue placeholder="Select Realtor" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {realtors.map((realtor) => (
                                                                <SelectItem key={realtor.id} value={realtor.id}>
                                                                    {`${realtor.firstName} ${realtor.lastName} (${realtor.agentCode})`}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <Button
                                                        onClick={() => handleAssignLead(lead.id, selectedRealtors[lead.id])}
                                                        disabled={!selectedRealtors[lead.id]}
                                                    >
                                                        Assign
                                                    </Button>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Accordion type="single" collapsible className="w-full">
                                                    <AccordionItem value="item-1">
                                                        <AccordionTrigger>View Details</AccordionTrigger>
                                                        <AccordionContent>
                                                            <div className="space-y-2">
                                                                <p><strong>Phone:</strong> {lead.phoneNumber}</p>
                                                                <p><strong>Email:</strong> {lead.emailAddress}</p>
                                                                <p><strong>Address:</strong> {`${lead.propertyAddress}, ${lead.city}, ${lead.state} ${lead.zipCode}`}</p>
                                                                <p><strong>Home Owner:</strong> {lead.isHomeOwner ? 'Yes' : 'No'}</p>
                                                                <p><strong>Property Value:</strong> ${lead.propertyValue.toLocaleString()}</p>
                                                                <p><strong>Has Realtor Contract:</strong> {lead.hasRealtorContract ? 'Yes' : 'No'}</p>
                                                                <p><strong>Submission Date:</strong> {new Date(lead.submissionDate).toLocaleString()}</p>

                                                                <h4 className="font-bold mt-4">Assignment History:</h4>
                                                                {lead.assignments.map((assignment, index) => (
                                                                    <div key={index} className="bg-gray-100 p-2 rounded mb-2">
                                                                        <p><strong>Agent Code:</strong> {assignment.agentCode}</p>
                                                                        <p><strong>Realtor:</strong> {`${assignment.realtorFirstName} ${assignment.realtorLastName}`}</p>
                                                                        <p><strong>Date Sent:</strong> {new Date(assignment.dateSent).toLocaleString()}</p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </AccordionContent>
                                                    </AccordionItem>
                                                </Accordion>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle>Realtor Management</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Agent Code</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Phone</TableHead>
                                        <TableHead>Brokerage</TableHead>
                                        <TableHead>State</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {realtors.map((realtor) => (
                                        <TableRow key={realtor.id}>
                                            <TableCell>{realtor.agentCode}</TableCell>
                                            <TableCell>{`${realtor.firstName} ${realtor.lastName}`}</TableCell>
                                            <TableCell>{realtor.email}</TableCell>
                                            <TableCell>{realtor.phoneNumber}</TableCell>
                                            <TableCell>{realtor.brokerage}</TableCell>
                                            <TableCell>{realtor.state}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}