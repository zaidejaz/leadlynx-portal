import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LeadActionDialog } from './LeadActionDialog'
import { Lead } from '../types'

interface LeadTableProps {
  leads: Lead[]
  onStatusUpdate: (assignmentId: string, newStatus: string) => Promise<void>
  onAddComment: (assignmentId: string, comment: string) => Promise<void>
}

export const LeadTable: React.FC<LeadTableProps> = ({ leads, onStatusUpdate, onAddComment }) => {
  return (
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
              <LeadActionDialog
                lead={lead}
                onStatusUpdate={onStatusUpdate}
                onAddComment={onAddComment}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}