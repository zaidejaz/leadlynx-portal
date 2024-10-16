    // app/super-admin/actions.ts
'use server'

import { Lead, PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function getUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
      },
    })
    return users
  } catch (error) {
    console.error('Error fetching users:', error)
    throw new Error('Failed to fetch users')
  }
}

export async function addUser(userData: {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  password: string;
}) {
  try {
    const hashedPassword = await bcrypt.hash(userData.password, 10)

    const newUser = await prisma.user.create({
      data: {
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        password: hashedPassword,
        isActive: true,
      },
    })

    revalidatePath('/super-admin')
    return { success: true, user: newUser }
  } catch (error) {
    console.error('Error adding user:', error)
    return { success: false, error: 'Failed to add user' }
  }
}

export async function updateUserRole(data: { userId: string; role: string }) {
  try {
    const updatedUser = await prisma.user.update({
      where: { id: data.userId },
      data: { role: data.role },
    })

    revalidatePath('/super-admin')
    return { success: true, user: updatedUser }
  } catch (error) {
    console.error('Error updating user role:', error)
    return { success: false, error: 'Failed to update user role' }
  }
}

export async function updateUserStatus(data: { userId: string; isActive: boolean }) {
  try {
    const updatedUser = await prisma.user.update({
      where: { id: data.userId },
      data: { isActive: data.isActive },
    })

    revalidatePath('/super-admin')
    return { success: true, user: updatedUser }
  } catch (error) {
    console.error('Error updating user status:', error)
    return { success: false, error: 'Failed to update user status' }
  }
}

export async function deleteUser(data: { userId: string }) {
  try {
    await prisma.user.delete({
      where: { id: data.userId },
    })

    revalidatePath('/super-admin')
    return { success: true }
  } catch (error) {
    console.error('Error deleting user:', error)
    return { success: false, error: 'Failed to delete user' }
  }
}

// Super Admin specific actions
export async function deleteRecord(formData: FormData) {
  const recordId = formData.get('recordId') as string
  const recordType = formData.get('recordType') as 'lead' | 'user' | 'leadAssignment'

  try {
    switch (recordType) {
      case 'lead':
        await prisma.lead.delete({ where: { id: recordId } })
        break
      case 'user':
        await prisma.user.delete({ where: { id: recordId } })
        break
      case 'leadAssignment':
        await prisma.leadAssignment.delete({ where: { id: recordId } })
        break
      default:
        throw new Error('Invalid record type')
    }

    revalidatePath('/super-admin')
    return { success: true }
  } catch (error) {
    console.error('Error deleting record:', error)
    return { success: false, error: 'Failed to delete record' }
  }
}



export async function getLeads(): Promise<Lead[]> {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: { submissionDate: 'desc' },
    })
    return leads
  } catch (error) {
    console.error('Error fetching leads:', error)
    throw new Error('Failed to fetch leads')
  }
}

export async function updateLead(updatedLead: Lead): Promise<Lead> {
  try {
    const lead = await prisma.lead.update({
      where: { id: updatedLead.id },
      data: {
        firstName: updatedLead.firstName,
        lastName: updatedLead.lastName,
        phoneNumber: updatedLead.phoneNumber,
        emailAddress: updatedLead.emailAddress,
        propertyAddress: updatedLead.propertyAddress,
        city: updatedLead.city,
        state: updatedLead.state,
        zipCode: updatedLead.zipCode,
        isHomeOwner: updatedLead.isHomeOwner,
        propertyValue: updatedLead.propertyValue,
        hasRealtorContract: updatedLead.hasRealtorContract,
        status: updatedLead.status,
        // Don't update submissionDate, leadId, or other fields that should remain constant
      },
    })
    revalidatePath('/super-admin')
    return lead
  } catch (error) {
    console.error('Error updating lead:', error)
    throw new Error('Failed to update lead')
  }
}

export async function deleteLead(leadId: string): Promise<void> {
  try {
    await prisma.lead.delete({
      where: { id: leadId },
    })
    revalidatePath('/super-admin')
  } catch (error) {
    console.error('Error deleting lead:', error)
    throw new Error('Failed to delete lead')
  }
}