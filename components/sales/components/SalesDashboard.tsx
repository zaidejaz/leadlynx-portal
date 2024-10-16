'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { submitRealtorInfo, getRealtors, getSalesSummary } from '../actions'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Pagination } from "@/components/ui/pagination"
import ZipCodeInput from './ZipCodeInput'

interface Realtor {
    id: string;
    agentCode: string;
    firstName: string;
    lastName: string;
    emailAddress: string;
    phoneNumber: string;
    brokerage: string;
    state: string;
    isActive: boolean;
    centralZipCode: string;
    radius: number;
    signUpCategory: string;
    teamMembers: number | null;
    zipCodes: string[];
    contactSigned: boolean;
}

interface SalesSummary {
    monthly: number;
    individual: number;
    individualPro: number;
    team: number;
    brokerage: number;
    totalRevenue: number;
}

function toTitleCase(str) {
  return str.replace(
    /\w\S*/g,
    text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
  );
}
const REALTORS_PER_PAGE = 10;

export default function SalesDashboard() {
    const [realtors, setRealtors] = useState<Realtor[]>([])
    const [salesSummary, setSalesSummary] = useState<SalesSummary | null>(null)
    const [activeView, setActiveView] = useState<'add' | 'view' | 'summary'>('add')
    const [signUpCategory, setSignUpCategory] = useState<string>('individual')
    const [zipCodes, setZipCodes] = useState<string[]>([])
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [formData, setFormData] = useState({
      agentCode: '',
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      brokerage: '',
      state: '',
      centralZipCode: '',
      radius: '',
      teamMembers: '',
      password: '',
      confirmPassword: '',
    })
    const { data: session, status } = useSession()
    const router = useRouter()
  
    useEffect(() => {
      if (status === 'unauthenticated') {
        router.push('/login')
      } else if (status === 'authenticated' && session?.user?.role !== 'sales') {
        router.push('/unauthorized')
      } else if (status === 'authenticated') {
        fetchRealtors()
        fetchSalesSummary()
      }
    }, [status, session, router, currentPage])
  
    const fetchRealtors = async () => {
      try {
        const result = await getRealtors(currentPage, REALTORS_PER_PAGE)
        if (result.success) {
          setRealtors(result.realtors)
          setTotalPages(Math.ceil(result.totalCount / REALTORS_PER_PAGE))
        } else {
          throw new Error(result.error)
        }
      } catch (err) {
        console.error('Error fetching realtors:', err)
        toast.error("Failed to fetch realtors. Please try again later.")
      }
    }
  
    const fetchSalesSummary = async () => {
      try {
        const summary = await getSalesSummary()
        setSalesSummary(summary)
      } catch (err) {
        console.error('Error fetching sales summary:', err)
        toast.error("Failed to fetch sales summary. Please try again later.")
      }
    }
  
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      const submitData = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, value)
      })
      submitData.append('zipCodes', zipCodes.join(','))
      submitData.append('signUpCategory', signUpCategory)
  
      try {
        const result = await submitRealtorInfo(submitData)
        if (result.success) {
          toast.success("Realtor added successfully!")
          fetchRealtors()
          fetchSalesSummary()
          // Reset form
          setFormData({
            agentCode: '',
            firstName: '',
            lastName: '',
            phone: '',
            email: '',
            brokerage: '',
            state: '',
            centralZipCode: '',
            radius: '',
            teamMembers: '',
            password: '',
            confirmPassword: '',
          })
          setZipCodes([])
          setSignUpCategory('individual')
        } else {
          throw new Error(result.error || 'Unknown error occurred')
        }
      } catch (err) {
        console.error('Error submitting realtor info:', err)
        toast.error(err instanceof Error ? err.message : "Failed to submit realtor information. Please try again.")
      }
    }
  
    const handlePageChange = (page: number) => {
      setCurrentPage(page)
    }

    if (!session || session.user.role !== 'sales') {
      return null
    }
  
    return (
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-md">
          <div className="p-4">
            <h2 className="text-2xl font-bold mb-6">Sales Dashboard</h2>
            <nav>
              <Button
                variant={activeView === 'add' ? 'default' : 'ghost'}
                className="w-full justify-start mb-2"
                onClick={() => setActiveView('add')}
              >
                Add Realtor
              </Button>
              <Button
                variant={activeView === 'view' ? 'default' : 'ghost'}
                className="w-full justify-start mb-2"
                onClick={() => setActiveView('view')}
              >
                View Realtors
              </Button>
              <Button
                variant={activeView === 'summary' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveView('summary')}
              >
                Sales Summary
              </Button>
            </nav>
          </div>
        </div>
  
        {/* Main content */}
        <div className="flex-1 p-8 overflow-auto">
          {activeView === 'add' && (
            <Card>
              <CardHeader>
                <CardTitle>Add Realtor</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input name="agentCode" placeholder="Agent Code" required value={formData.agentCode} onChange={handleInputChange} />
                  <Input name="firstName" placeholder="First Name" required value={formData.firstName} onChange={handleInputChange} />
                  <Input name="lastName" placeholder="Last Name" required value={formData.lastName} onChange={handleInputChange} />
                  <Input name="phone" placeholder="Phone" type="tel" required value={formData.phone} onChange={handleInputChange} />
                  <Input name="email" placeholder="Email" type="email" required value={formData.email} onChange={handleInputChange} />
                  <Input name="brokerage" placeholder="Brokerage" required value={formData.brokerage} onChange={handleInputChange} />
                  <Input name="state" placeholder="State" required value={formData.state} onChange={handleInputChange} />
                  <Input name="centralZipCode" placeholder="Central Zip Code" required value={formData.centralZipCode} onChange={handleInputChange} />
                  <Input name="radius" placeholder="Radius (Miles)" type="number" required value={formData.radius} onChange={handleInputChange} />
                  <Select name="signUpCategory" value={signUpCategory} onValueChange={setSignUpCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sign-Up Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">Individual</SelectItem>
                      <SelectItem value="individualPro">Individual Pro</SelectItem>
                      <SelectItem value="team">Team</SelectItem>
                      <SelectItem value="brokerage">Brokerage</SelectItem>
                      <SelectItem value="monthly">Monthly Subscription</SelectItem>
                    </SelectContent>
                  </Select>
                  {(signUpCategory === 'team' || signUpCategory === 'brokerage') && (
                    <Input name="teamMembers" placeholder="Total Team Members" type="number" required value={formData.teamMembers} onChange={handleInputChange} />
                  )}
                  <ZipCodeInput zipCodes={zipCodes} setZipCodes={setZipCodes} />
                  <Input name="password" placeholder="Password" type="password" required value={formData.password} onChange={handleInputChange} />
                  <Input name="confirmPassword" placeholder="Confirm Password" type="password" required value={formData.confirmPassword} onChange={handleInputChange} />
                  <Button type="submit">Submit Realtor Information</Button>
                </form>
              </CardContent>
            </Card>
          )}
          
          {activeView === 'view' && (
            <Card>
              <CardHeader>
                <CardTitle>View Realtors</CardTitle>
              </CardHeader>
              <CardContent>
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
                    {realtors.map((realtor) => (
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
                    onPageChange={handlePageChange}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {activeView === 'summary' && salesSummary && (
            <Card>
              <CardHeader>
                <CardTitle>Sales Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Count</TableHead>
                      <TableHead>Revenue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Monthly Subscription ($80)</TableCell>
                      <TableCell>{salesSummary.monthly}</TableCell>
                      <TableCell>${salesSummary.monthly * 80}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Individual ($299)</TableCell>
                      <TableCell>{salesSummary.individual}</TableCell>
                      <TableCell>${salesSummary.individual * 299}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Individual Pro ($499)</TableCell>
                      <TableCell>{salesSummary.individualPro}</TableCell>
                      <TableCell>${salesSummary.individualPro * 499}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Teams ($4399)</TableCell>
                      <TableCell>{salesSummary.team}</TableCell>
                      <TableCell>${salesSummary.team * 4399}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Brokerage ($10999)</TableCell>
                      <TableCell>{salesSummary.brokerage}</TableCell>
                      <TableCell>${salesSummary.brokerage * 10999}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={2}><strong>Total Revenue</strong></TableCell>
                      <TableCell><strong>${salesSummary.totalRevenue}</strong></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    )
}