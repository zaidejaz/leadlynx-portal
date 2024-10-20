import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Lead } from '../types';
import { LeadEditDialog } from './LeadEditDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface LeadTableProps {
  leads: Lead[];
  onEditLead: (lead: Lead) => void;
  editingLead: Lead | null;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onUpdate: () => void;
}

export const LeadTable: React.FC<LeadTableProps> = ({
  leads,
  onEditLead,
  editingLead,
  onInputChange,
  onUpdate
}) => {
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

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Leads</CardTitle>
      </CardHeader>
      <CardContent>
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
                  <LeadEditDialog
                    lead={lead}
                    editingLead={editingLead}
                    onEditLead={onEditLead}
                    onInputChange={onInputChange}
                    onUpdate={onUpdate}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};