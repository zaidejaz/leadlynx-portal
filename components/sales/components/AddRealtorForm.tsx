import React, { useState } from 'react'
import { submitRealtorInfo } from '../actions'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import ZipCodeInput from './ZipCodeInput'

interface AddRealtorFormProps {
  onRealtorAdded: () => void
}

export const AddRealtorForm: React.FC<AddRealtorFormProps> = ({ onRealtorAdded }) => {
  const [signUpCategory, setSignUpCategory] = useState<string>('individual')
  const [zipCodes, setZipCodes] = useState<string[]>([])
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
        onRealtorAdded()
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

  return (
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
          <Input name="radius" placeholder="Radius (Miles)" type="number" required value={formData.radius} onChange={handleInputChange} />          <Select name="signUpCategory" value={signUpCategory} onValueChange={setSignUpCategory}>
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
  )
}