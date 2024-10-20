import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
    return (
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
                            <TableHead>Status</TableHead>
                            <TableHead>Assignments</TableHead>
                            <TableHead>Actions</TableHead>
                            <TableHead>Details</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {leads.map((lead) => (
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
            </CardContent>
        </Card>
    );
};