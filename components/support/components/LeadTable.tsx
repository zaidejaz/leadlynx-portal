import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { LeadDetails } from './LeadDetails';
import { Lead, Realtor } from '../types';

interface LeadTableProps {
    leads: Lead[];
    selectedRealtors: { [key: string]: string | null };
    setSelectedRealtors: React.Dispatch<React.SetStateAction<{ [key: string]: string | null }>>;
    getAvailableRealtors: (zipCode: string) => Realtor[];
    handleAssignLead: (leadId: string, realtorId: string | null) => Promise<void>;
    handleUpdateStatus: (leadId: string, newStatus: string) => Promise<void>;
}

export const LeadTable: React.FC<LeadTableProps> = ({
    leads,
    selectedRealtors,
    setSelectedRealtors,
    getAvailableRealtors,
    handleAssignLead,
    handleUpdateStatus
}) => {
    const [filters, setFilters] = useState({
        leadId: '',
        name: '',
        status: '',
        assignments: ''
    });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 100;

    // Apply filters
    const filteredLeads = leads.filter(lead => {
        return (
            lead.leadId.toLowerCase().includes(filters.leadId.toLowerCase()) &&
            `${lead.firstName} ${lead.lastName}`.toLowerCase().includes(filters.name.toLowerCase()) &&
            lead.status.toLowerCase().includes(filters.status.toLowerCase()) &&
            (filters.assignments === '' || lead.assignments.length.toString().includes(filters.assignments))
        );
    });

    // Calculate pagination
    const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedLeads = filteredLeads.slice(startIndex, endIndex);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Accepted Leads</CardTitle>
                <div className="grid grid-cols-4 gap-4 mt-4">
                    <Input
                        placeholder="Filter by Lead ID"
                        value={filters.leadId}
                        onChange={(e) => setFilters(prev => ({ ...prev, leadId: e.target.value }))}
                    />
                    <Input
                        placeholder="Filter by Name"
                        value={filters.name}
                        onChange={(e) => setFilters(prev => ({ ...prev, name: e.target.value }))}
                    />
                    <Input
                        placeholder="Filter by Status"
                        value={filters.status}
                        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    />
                    <Input
                        placeholder="Filter by Assignments"
                        value={filters.assignments}
                        onChange={(e) => setFilters(prev => ({ ...prev, assignments: e.target.value }))}
                    />
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Lead ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Assignments</TableHead>
                            <TableHead>Actions</TableHead>
                            <TableHead>Details</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedLeads.map((lead) => (
                            <TableRow key={lead.id}>
                                <TableCell>{lead.leadId}</TableCell>
                                <TableCell>{`${lead.firstName} ${lead.lastName}`}</TableCell>
                                <TableCell>{lead.status}</TableCell>
                                <TableCell>
                                    <Badge variant="secondary">
                                        {lead.assignments.length}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center space-x-2">
                                        <Button
                                            onClick={() => handleUpdateStatus(lead.id, 'Rejected-Overturned')}
                                        >
                                            Reject
                                        </Button>
                                        <Select
                                            value={selectedRealtors[lead.id] || ""}
                                            onValueChange={(value) => setSelectedRealtors(prev => ({ ...prev, [lead.id]: value }))}
                                        >
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue placeholder="Select Realtor" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {getAvailableRealtors(lead.zipCode).map((realtor) => (
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
                                    <LeadDetails lead={lead} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                
                {/* Pagination Controls */}
                <div className="flex items-center justify-between px-2 py-4">
                    <div className="flex space-x-2">
                        <Button
                            variant="outline"
                            onClick={() => setCurrentPage(1)}
                            disabled={currentPage === 1}
                        >
                            First
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setCurrentPage(totalPages)}
                            disabled={currentPage === totalPages}
                        >
                            Last
                        </Button>
                    </div>
                    <div className="text-sm text-gray-600">
                        Page {currentPage} of {totalPages} ({filteredLeads.length} total leads)
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};