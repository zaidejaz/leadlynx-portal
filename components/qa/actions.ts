'use server'

import { PrismaClient, Lead } from '@prisma/client'
import { revalidatePath } from 'next/cache'

const prisma = new PrismaClient()

export async function getLeads(page: number = 1, pageSize: number = 10) {
  try {
    const skip = (page - 1) * pageSize;
    const [leads, totalCount] = await Promise.all([
      prisma.lead.findMany({
        orderBy: { submissionDate: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.lead.count(),
    ]);

    return {
      success: true,
      leads,
      totalCount,
    };
  } catch (error) {
    console.error('Error fetching leads:', error);
    return {
      success: false,
      error: 'Failed to fetch leads',
    };
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
    });
    revalidatePath('/qa');
    return { success: true };
  } catch (error) {
    console.error('Error updating lead:', error);
    return { success: false, error: 'Failed to update lead' };
  }
}

export async function deleteLead(leadId: string) {
  try {
    await prisma.lead.delete({
      where: { id: leadId },
    });
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Error deleting lead:', error);
    return { success: false, error: 'Failed to delete lead' };
  }
}
