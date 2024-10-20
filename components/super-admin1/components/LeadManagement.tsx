"use client";
import React, { useState, useEffect } from 'react';
import { updateLead, deleteLead, getLeads } from '../actions';
import { Lead } from '@prisma/client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function LeadManagement() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const leadsPerPage = 100;

  useEffect(() => {
    fetchLeads();
  }, []);

  useEffect(() => {
    filterLeads();
  }, [leads, statusFilter, dateFilter, searchTerm]);

  const fetchLeads = async () => {
    try {
      const fetchedLeads = await getLeads();
      setLeads(fetchedLeads);
    } catch (error) {
      console.error('Error fetching leads:', error);
    }
  };

  const filterLeads = () => {
    let result = leads;

    if (statusFilter) {
      result = result.filter(lead => lead.status === statusFilter);
    }

    if (dateFilter) {
      result = result.filter(lead => lead.submissionDate.toString().startsWith(dateFilter));
    }

    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      result = result.filter(lead =>
        lead.firstName.toLowerCase().includes(lowercasedTerm) ||
        lead.lastName.toLowerCase().includes(lowercasedTerm) ||
        lead.emailAddress.toLowerCase().includes(lowercasedTerm) ||
        lead.phoneNumber.includes(searchTerm)
      );
    }

    setFilteredLeads(result);
    setCurrentPage(1);
  };

  const handleUpdateLead = async (updatedLead: Lead) => {
    try {
      await updateLead(updatedLead);
      setEditingLead(null);
      fetchLeads();
    } catch (error) {
      console.error('Error updating lead:', error);
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    try {
      await deleteLead(leadId);
      fetchLeads();
    } catch (error) {
      console.error('Error deleting lead:', error);
    }
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

  // Pagination
  const indexOfLastLead = currentPage * leadsPerPage;
  const indexOfFirstLead = indexOfLastLead - leadsPerPage;
  const currentLeads = filteredLeads.slice(indexOfFirstLead, indexOfLastLead);
  const totalPages = Math.ceil(filteredLeads.length / leadsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Lead Management</h2>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="flex space-x-4">
          <Select onValueChange={setStatusFilter} value={statusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Statuses" />
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
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
          <Input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
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
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentLeads.map((lead) => (
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
              <TableCell>{new Date(lead.submissionDate).toLocaleDateString()}</TableCell>
              <TableCell>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="mr-2" onClick={() => setEditingLead(lead)}>Edit</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Lead</DialogTitle>
                    </DialogHeader>
                    {editingLead && (
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        handleUpdateLead(editingLead);
                      }}>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="firstName" className="text-right">First Name</Label>
                            <Input id="firstName" value={editingLead.firstName} onChange={(e) => setEditingLead({ ...editingLead, firstName: e.target.value })} className="col-span-3" />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="lastName" className="text-right">Last Name</Label>
                            <Input id="lastName" value={editingLead.lastName} onChange={(e) => setEditingLead({ ...editingLead, lastName: e.target.value })} className="col-span-3" />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="phoneNumber" className="text-right">Phone Number</Label>
                            <Input id="phoneNumber" value={editingLead.phoneNumber} onChange={(e) => setEditingLead({ ...editingLead, phoneNumber: e.target.value })} className="col-span-3" />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="emailAddress" className="text-right">Email Address</Label>
                            <Input id="emailAddress" value={editingLead.emailAddress} onChange={(e) => setEditingLead({ ...editingLead, emailAddress: e.target.value })} className="col-span-3" />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="status" className="text-right">Status</Label>
                            <Select
                              value={editingLead.status}
                              onValueChange={(value) => setEditingLead({ ...editingLead, status: value })}
                            >
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
                          <div className="flex justify-end mt-4">
                            <Button type="submit">Save changes</Button>
                          </div>
                        </div>
                      </form>
                    )}
                  </DialogContent>
                </Dialog>
                <Button variant="destructive" onClick={() => handleDeleteLead(lead.id)}>Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="mt-4 flex justify-center">
        {Array.from({ length: totalPages }, (_, i) => (
          <Button
            key={i}
            onClick={() => paginate(i + 1)}
            variant={currentPage === i + 1 ? "default" : "outline"}
            className="mx-1"
          >
            {i + 1}
          </Button>
        ))}
      </div>
    </div>
  );
}