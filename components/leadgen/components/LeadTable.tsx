import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";

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

interface LeadTableProps {
    leads: Lead[];
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export const LeadTable: React.FC<LeadTableProps> = ({ leads, currentPage, totalPages, onPageChange }) => {
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

    return (
        <>
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
                    {leads.map((lead) => (
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
                onPageChange={onPageChange}
            />
        </>
    );
};