// app/support/actions.ts
'use server'

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'

const prisma = new PrismaClient()

export async function getAcceptedLeads() {
  try {
    const leads = await prisma.lead.findMany({
      where: { status: 'accepted' },
      include: {
        assignments: {
          include: {
            user: true
          }
        }
      },
      orderBy: { submissionDate: 'desc' }
    })

    return leads.map(lead => ({
      ...lead,
      assignments: lead.assignments.map(assignment => ({
        id: assignment.id,
        realtorFirstName: assignment.user.firstName,
        realtorLastName: assignment.user.lastName,
        dateSent: assignment.sentDate.toISOString(),
        leadId: lead.leadId
      }))
    }))
  } catch (error) {
    console.error('Error fetching accepted leads:', error)
    throw new Error('Failed to fetch accepted leads')
  }
}

export async function getRealtors() {
  try {
    const realtors = await prisma.user.findMany({
      where: { role: 'realtor' }
    })
    return realtors
  } catch (error) {
    console.error('Error fetching realtors:', error)
    throw new Error('Failed to fetch realtors')
  }
}

export async function assignLead(leadId: string, realtorId: string) {
  try {
    const assignment = await prisma.leadAssignment.create({
      data: {
        leadId: leadId,
        userId: realtorId,
        sentDate: new Date(),
        status: 'assigned'
      },
      include: {
        user: true,
        lead: true
      }
    })

    revalidatePath('/support')
    
    return {
      id: assignment.id,
      realtorFirstName: assignment.user.firstName,
      realtorLastName: assignment.user.lastName,
      dateSent: assignment.sentDate.toISOString(),
      leadId: assignment.lead.leadId
    }
  } catch (error) {
    console.error('Error assigning lead:', error)
    throw new Error('Failed to assign lead')
  }
}

export async function toggleRealtorStatus(realtorId: string, isActive: boolean) {
  try {
    await prisma.user.update({
      where: { id: realtorId },
      data: { isActive: isActive }
    })

    revalidatePath('/support')
  } catch (error) {
    console.error('Error toggling realtor status:', error)
    throw new Error('Failed to toggle realtor status')
  }
}