"use client";
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { createLead, getLeads } from './actions';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface Lead {
    id: string;
    leadId: string;
    submissionDate: Date;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    emailAddress: string;
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
    bedrooms: number;
    bathrooms: number;
    createdAt: Date;
    updatedAt: Date;
}

const allowedRoles = ['admin', 'leadgen'];

export default function LeadGeneration() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { toast } = useToast();
    const [activeView, setActiveView] = useState<'add' | 'view'>('add');
    const [leads, setLeads] = useState<Lead[]>([]);
    const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
    const [dateFilter, setDateFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

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
        const result = await getLeads();
        if (result.success) {
            setLeads(result.leads);
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
                lead.firstName.toLowerCase().includes(lowercasedTerm) ||
                lead.lastName.toLowerCase().includes(lowercasedTerm) ||
                (lead.emailAddress && lead.emailAddress.toLowerCase().includes(lowercasedTerm)) ||
                lead.phoneNumber.includes(searchTerm)
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
            setActiveView('view');
        } else {
            toast({
                title: "Error",
                description: "Failed to create lead. Please try again.",
                variant: "destructive",
            });
        }
    };

    if (status === 'loading') {
        return <div>Loading...</div>;
    }

    if (!session || !allowedRoles.includes(session.user.role)) {
        return null; // The useEffect will redirect to the unauthorized page
    }


    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="w-64 bg-white shadow-md">
                <div className="p-4">
                    <h2 className="text-2xl font-bold mb-6">Lead Generation</h2>
                    <nav>
                        <Button
                            variant={activeView === 'add' ? 'default' : 'ghost'}
                            className="w-full justify-start mb-2"
                            onClick={() => setActiveView('add')}
                        >
                            Add Lead
                        </Button>
                        <Button
                            variant={activeView === 'view' ? 'default' : 'ghost'}
                            className="w-full justify-start"
                            onClick={() => setActiveView('view')}
                        >
                            View Leads
                        </Button>
                    </nav>
                </div>
            </div>

            <div className="flex-1 p-8 overflow-auto">
                {activeView === 'add' ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>Add New Lead</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form action={handleCreateLead} className="space-y-4">
                                <Input
                                    name="firstName"
                                    placeholder="First Name"
                                    required
                                />
                                <Input
                                    name="lastName"
                                    placeholder="Last Name"
                                    required
                                />
                                <Input
                                    name="phoneNumber"
                                    placeholder="Phone Number"
                                    required
                                />
                                <Input
                                    name="emailAddress"
                                    placeholder="Email Address"
                                />
                                <Input
                                    name="propertyAddress"
                                    placeholder="Property Address"
                                    required
                                />
                                <Input
                                    name="city"
                                    placeholder="City"
                                    required
                                />
                                <Input
                                    name="state"
                                    placeholder="State"
                                    required
                                />
                                <Input
                                    name="zipCode"
                                    placeholder="Zip Code"
                                    required
                                />
                                <Select name="isHomeOwner" defaultValue="true">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Home Owner?" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="true">Yes</SelectItem>
                                        <SelectItem value="false">No</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Input
                                    name="propertyValue"
                                    placeholder="Property Value"
                                    type="number"
                                    required
                                />
                                <Select name="hasRealtorContract" defaultValue="true">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Has Realtor Contract?" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="true">Yes</SelectItem>
                                        <SelectItem value="false">No</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Input
                                    name="bedrooms"
                                    placeholder="Number of Bedrooms"
                                    type="number"
                                />
                                <Input
                                    name="bathrooms"
                                    placeholder="Number of Bathrooms"
                                    type="number"
                                />
                                <Button type="submit">Submit Lead</Button>
                            </form>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle>View Leads</CardTitle>
                        </CardHeader>
                        <CardContent>
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
                                    </SelectContent>
                                </Select>
                                <Input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search..."
                                />
                            </div>
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
                                        <TableHead>Bedrooms</TableHead>
                                        <TableHead>Bathrooms</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Submission Date</TableHead>
                                        <TableHead>Recording</TableHead>
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
                                            <TableCell>{lead.bedrooms}</TableCell>
                                            <TableCell>{lead.bathrooms}</TableCell>
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
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}