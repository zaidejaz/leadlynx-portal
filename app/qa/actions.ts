'use server'

import { PrismaClient, Lead } from '@prisma/client'
import { revalidatePath } from 'next/cache'

const prisma = new PrismaClient()

export async function getLeads() {
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

export async function updateLead(lead: Lead) {
  try {
    await prisma.lead.update({
      where: { id: lead.id },
      data: {
        firstName: lead.firstName,
        lastName: lead.lastName,
        phoneNumber: lead.phoneNumber,
        emailAddress: lead.emailAddress,
        propertyAddress: lead.propertyAddress,
        city: lead.city,
        state: lead.state,
        zipCode: lead.zipCode,
        isHomeOwner: lead.isHomeOwner,
        propertyValue: lead.propertyValue,
        hasRealtorContract: lead.hasRealtorContract,
        status: lead.status,
        recording: lead.recording,
        additionalNotes: lead.additionalNotes,
      },
    })
    revalidatePath('/qa')
    return { success: true }
  } catch (error) {
    console.error('Error updating lead:', error)
    return { success: false, error: 'Failed to update lead' }
  }
}