'use server'

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'

const prisma = new PrismaClient()

interface Lead {
  id: string;
  leadId: string;
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
  submissionDate: string;
  assignments: {
      id: string;
      agentCode: string;
      realtorFirstName: string;
      realtorLastName: string;
      dateSent: string;
      leadId: string;
  }[];
}


export async function getAcceptedLeads() {
  try {
    const leads = await prisma.lead.findMany({
      where: { status: 'accepted' },
      include: {
        assignments: {
          include: {
            user: true
          },
          orderBy: { sentDate: 'desc' }
        }
      },
      orderBy: { submissionDate: 'desc' }
    })
    
    const leadsWithRealtors = await Promise.all(leads.map(async (lead) => {
      const assignmentsWithRealtors = await Promise.all(lead.assignments.map(async (assignment) => {
        const realtor = await prisma.realtor.findUnique({
          where: { emailAddress: assignment.user.email }
        })
        return {
          id: assignment.id,
          agentCode: realtor?.agentCode ?? 'N/A',
          realtorFirstName: assignment.user.firstName,
          realtorLastName: assignment.user.lastName,
          dateSent: assignment.sentDate.toISOString(),
          leadId: lead.leadId
        }
      }))
      return {
        ...lead,
        assignments: assignmentsWithRealtors
      }
    }))
    
    return leadsWithRealtors
  } catch (error) {
    console.error('Error fetching accepted leads:', error)
    throw new Error('Failed to fetch accepted leads')
  }
}

export async function getRealtors() {
  try {
    const realtors = await prisma.realtor.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return realtors.map(realtor => ({
      id: realtor.id,
      firstName: realtor.firstName,
      lastName: realtor.lastName,
      email: realtor.emailAddress,
      phoneNumber: realtor.phoneNumber,
      agentCode: realtor.agentCode,
      brokerage: realtor.brokerage,
      state: realtor.state,
    }))
  } catch (error) {
    console.error('Error fetching realtors:', error)
    throw new Error('Failed to fetch realtors')
  }
}

export async function assignLead(leadId: string, realtorId: string) {
  try {
    const realtor = await prisma.realtor.findUnique({
      where: { id: realtorId }
    })
    if (!realtor) {
      throw new Error('Realtor not found')
    }
    const user = await prisma.user.findUnique({
      where: { email: realtor.emailAddress }
    })
    if (!user) {
      throw new Error('User not found for this realtor')
    }
    const assignment = await prisma.leadAssignment.create({
      data: {
        leadId: leadId,
        userId: user.id,
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
      agentCode: realtor.agentCode,
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