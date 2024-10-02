'use client'

import { useState, useEffect, useRef } from 'react'
import { submitRealtorInfo, getRealtors } from './actions'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

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
}

const allowedRoles = ['admin', 'sales'];

export default function SalesPage() {
  const [realtors, setRealtors] = useState<Realtor[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeView, setActiveView] = useState<'add' | 'view'>('add')
  const { toast } = useToast()
  const formRef = useRef<HTMLFormElement>(null)
  const { data: session, status } = useSession();
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || !allowedRoles.includes(session.user.role)) {
      router.push('/unauthorized');
    } else {
      fetchRealtors()
    }
  }, [session, status, router]);

  const fetchRealtors = async () => {
    try {
      setLoading(true)
      const fetchedRealtors = await getRealtors()
      if (Array.isArray(fetchedRealtors)) {
        setRealtors(fetchedRealtors)
      } else {
        throw new Error('Fetched data is not an array')
      }
    } catch (err) {
      console.error('Error fetching realtors:', err)
      toast({
        title: "Error",
        description: "Failed to fetch realtors. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    try {
      const result = await submitRealtorInfo(formData)
      if (result.success) {
        toast({
          title: "Success",
          description: "Realtor added successfully!",
        })
        fetchRealtors()
        if (formRef.current) {
          formRef.current.reset()
          // Reset Select components
          const selects = formRef.current.querySelectorAll('select')
          selects.forEach(select => {
            select.value = ''
          })
        }
      } else {
        throw new Error(result.error || 'Unknown error occurred')
      }
    } catch (err) {
      console.error('Error submitting realtor info:', err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to submit realtor information. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (!session || !allowedRoles.includes(session.user.role)) {
    return null; // The useEffect will redirect to the unauthorized page
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
              className="w-full justify-start"
              onClick={() => setActiveView('view')}
            >
              View Realtors
            </Button>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-8 overflow-auto">
        <Toaster />

        {activeView === 'add' ? (
          <Card>
            <CardHeader>
              <CardTitle>Add Realtor</CardTitle>
            </CardHeader>
            <CardContent>
              <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input name="agentCode" placeholder="Agent Code" required />
                  <Input name="firstName" placeholder="First Name" required />
                  <Input name="lastName" placeholder="Last Name" required />
                  <Input name="phone" placeholder="Phone" type="tel" required />
                  <Input name="email" placeholder="Email" type="email" required />
                  <Input name="brokerage" placeholder="Brokerage" required />
                  <Input name="state" placeholder="State" required />
                  <Input name="centralZipCode" placeholder="Central Zip Code" required />
                  <Input name="radius" placeholder="Radius (Miles)" type="number" required />
                  <Select name="signUpCategory" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Sign-Up Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">Individual</SelectItem>
                      <SelectItem value="team">Team</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input name="teamMembers" placeholder="Total Team Members (if applicable)" type="number" />
                  <Input name="password" placeholder="Password" type="password" required />
                  <Input name="confirmPassword" placeholder="Confirm Password" type="password" required />
                </div>
                <Button type="submit">Submit Realtor Information</Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>View Realtors</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Loading realtors...</p>
              ) : realtors && realtors.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Agent Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Brokerage</TableHead>
                      <TableHead>State</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {realtors.map((realtor) => (
                      <TableRow key={realtor.id}>
                        <TableCell>{realtor.agentCode}</TableCell>
                        <TableCell>{`${realtor.firstName} ${realtor.lastName}`}</TableCell>
                        <TableCell>{realtor.emailAddress}</TableCell>
                        <TableCell>{realtor.phoneNumber}</TableCell>
                        <TableCell>{realtor.brokerage}</TableCell>
                        <TableCell>{realtor.state}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded ${realtor.isActive ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                            {realtor.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p>No realtors found.</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}