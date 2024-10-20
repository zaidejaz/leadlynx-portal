import React, { useState, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Pagination } from "@/components/ui/pagination"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Realtor } from '../types'

interface RealtorTableProps {
  realtors: Realtor[]
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

function toTitleCase(str: string) {
  return str.replace(
    /\w\S*/g,
    text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
  );
}

export const RealtorTable: React.FC<RealtorTableProps> = ({ realtors, currentPage, totalPages, onPageChange }) => {
  const [filteredRealtors, setFilteredRealtors] = useState<Realtor[]>(realtors);
  const [stateFilter, setStateFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    const filtered = realtors.filter((realtor) => {
      return (
        (stateFilter === 'all' || realtor.state === stateFilter) &&
        (categoryFilter === 'all' || realtor.signUpCategory === categoryFilter) &&
        (statusFilter === 'all' || 
          (statusFilter === 'active' && realtor.isActive) || 
          (statusFilter === 'inactive' && !realtor.isActive)) &&
        (searchTerm === '' || 
          realtor.agentCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
          realtor.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          realtor.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          realtor.emailAddress.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    });
    setFilteredRealtors(filtered);
  }, [realtors, stateFilter, categoryFilter, statusFilter, searchTerm]);

  const uniqueStates = Array.from(new Set(realtors.map(realtor => realtor.state)));
  const uniqueCategories = Array.from(new Set(realtors.map(realtor => realtor.signUpCategory)));

  return (
    <Card>
      <CardHeader>
        <CardTitle>View Realtors</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-4 mb-4">
          <Select value={stateFilter} onValueChange={setStateFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by State" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All States</SelectItem>
              {uniqueStates.map(state => (
                <SelectItem key={state} value={state}>{state}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {uniqueCategories.map(category => (
                <SelectItem key={category} value={category}>{toTitleCase(category)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="text"
            placeholder="Search by name, email, or agent code"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Agent Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Brokerage</TableHead>
              <TableHead>State</TableHead>
              <TableHead>Central Zip-code</TableHead>
              <TableHead>Radius</TableHead>
              <TableHead>Sign-Up Category</TableHead>
              <TableHead>Zip-codes</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Contact Signed</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRealtors.map((realtor) => (
              <TableRow key={realtor.id}>
                <TableCell>{realtor.agentCode}</TableCell>
                <TableCell>{`${realtor.firstName} ${realtor.lastName}`}</TableCell>
                <TableCell>{realtor.phoneNumber}</TableCell>
                <TableCell>{realtor.emailAddress}</TableCell>
                <TableCell>{realtor.brokerage}</TableCell>
                <TableCell>{realtor.state}</TableCell>
                <TableCell>{realtor.centralZipCode}</TableCell>
                <TableCell>{realtor.radius}</TableCell>
                <TableCell>{toTitleCase(realtor.signUpCategory)}</TableCell>
                <TableCell>
                  {realtor.zipCodes.length}
                  {realtor.zipCodes.length < 50 && (
                    <span className="text-red-500 ml-2">Zip-codes are less than 50</span>
                  )}
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded ${realtor.isActive ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                    {realtor.isActive ? 'Active' : 'Inactive'}
                  </span>
                </TableCell>
                <TableCell>{realtor.contactSigned ? 'Yes' : 'No'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="mt-4">
          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={onPageChange}
          />
        </div>
      </CardContent>
    </Card>
  )
}