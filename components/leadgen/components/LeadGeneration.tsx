"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { createLead, getLeads, importLeads, exportLeads } from '../actions';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Pagination } from "@/components/ui/pagination";
import { LeadGenReporting } from './LeadGenReporting';

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
    bedrooms: number | null;
    bathrooms: number | null;
    createdAt: Date;
    updatedAt: Date;
}

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
    const formRef = useRef<HTMLFormElement>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
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
            if (formRef.current) {
                formRef.current.reset();
            }
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
                            className="w-full justify-start mb-2"
                            onClick={() => setActiveView('view')}
                        >
                            View Leads
                        </Button>
                        <Button
                            variant={activeView === 'report' ? 'default' : 'ghost'}
                            className="w-full justify-start"
                            onClick={() => setActiveView('report')}
                        >
                            Reporting
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
                            <form ref={formRef} action={handleCreateLead} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
                                        <Input id="firstName" name="firstName" placeholder="First Name" required />
                                    </div>
                                    <div>
                                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
                                        <Input id="lastName" name="lastName" placeholder="Last Name" required />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Phone Number</label>
                                    <Input id="phoneNumber" name="phoneNumber" placeholder="Phone Number" required />
                                </div>
                                <div>
                                    <label htmlFor="emailAddress" className="block text-sm font-medium text-gray-700">Email Address</label>
                                    <Input id="emailAddress" name="emailAddress" placeholder="Email Address" />
                                </div>
                                <div>
                                    <label htmlFor="propertyAddress" className="block text-sm font-medium text-gray-700">Property Address</label>
                                    <Input id="propertyAddress" name="propertyAddress" placeholder="Property Address" required />
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                                        <Input id="city" name="city" placeholder="City" required />
                                    </div>
                                    <div>
                                        <label htmlFor="state" className="block text-sm font-medium text-gray-700">State</label>
                                        <Input id="state" name="state" placeholder="State" required />
                                    </div>
                                    <div>
                                        <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">Zip Code</label>
                                        <Input id="zipCode" name="zipCode" placeholder="Zip Code" required />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="isHomeOwner" className="block text-sm font-medium text-gray-700">Home Owner?</label>
                                    <Select name="isHomeOwner" defaultValue="true">
                                        <SelectTrigger>
                                            <SelectValue placeholder="Home Owner?" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="true">Yes</SelectItem>
                                            <SelectItem value="false">No</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label htmlFor="propertyValue" className="block text-sm font-medium text-gray-700">Property Value</label>
                                    <Input id="propertyValue" name="propertyValue" placeholder="Property Value" type="number" required />
                                </div>
                                <div>
                                    <label htmlFor="hasRealtorContract" className="block text-sm font-medium text-gray-700">Has Realtor Contract?</label>
                                    <Select name="hasRealtorContract" defaultValue="true">
                                        <SelectTrigger>
                                            <SelectValue placeholder="Has Realtor Contract?" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="true">Yes</SelectItem>
                                            <SelectItem value="false">No</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700">Number of Bedrooms</label>
                                        <Input id="bedrooms" name="bedrooms" placeholder="Number of Bedrooms" type="number" />
                                    </div>
                                    <div>
                                        <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700">Number of Bathrooms</label>
                                        <Input id="bathrooms" name="bathrooms" placeholder="Number of Bathrooms" type="number" />
                                    </div>
                                </div>
                                <Button type="submit">Submit Lead</Button>
                            </form>
                        </CardContent>
                    </Card>
                ) : activeView === 'view' ? (
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
                                        <SelectItem value="rejected_overturned">Rejected Overturned</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search..."
                                />
                                <input
                                    type="file"
                                    accept=".csv"
                                    onChange={handleImportCSV}
                                    ref={fileInputRef}
                                    className="hidden"
                                />
                                <Button onClick={() => fileInputRef.current?.click()}>
                                    Import CSV
                                </Button>
                                <Button onClick={handleExportCSV}>
                                    Export CSV
                                </Button>
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
                            <Pagination
                                totalPages={totalPages}
                                currentPage={currentPage}
                                onPageChange={handlePageChange}
                            />
                        </CardContent>
                    </Card>
                ) : (
                    <LeadGenReporting />
                )}
            </div>
        </div>
    );
}