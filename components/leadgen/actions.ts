'use server'

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';

const prisma = new PrismaClient();

function generateLeadId() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export async function createLead(formData: FormData) {
  const leadId = generateLeadId();
  try {
    const lead = await prisma.lead.create({
      data: {
        leadId,
        firstName: formData.get('firstName') as string,
        lastName: formData.get('lastName') as string,
        phoneNumber: formData.get('phoneNumber') as string,
        emailAddress: formData.get('emailAddress') as string || undefined,
        propertyAddress: formData.get('propertyAddress') as string,
        city: formData.get('city') as string,
        state: formData.get('state') as string,
        zipCode: formData.get('zipCode') as string,
        isHomeOwner: formData.get('isHomeOwner') === 'true',
        propertyValue: parseFloat(formData.get('propertyValue') as string),
        hasRealtorContract: formData.get('hasRealtorContract') === 'true',
        bedrooms: formData.get('bedrooms') ? parseInt(formData.get('bedrooms') as string) : undefined,
        bathrooms: formData.get('bathrooms') ? parseInt(formData.get('bathrooms') as string) : undefined,
        status: 'pending'
      },
    });
    revalidatePath('/leadgen');
    return { success: true, leadId: lead.leadId };
  } catch (error) {
    console.error('Error creating lead:', error);
    return { success: false, error: 'Failed to create lead' };
  }
}

export async function getLeads(page: number, perPage: number) {
  try {
    const totalCount = await prisma.lead.count();
    const leads = await prisma.lead.findMany({
      orderBy: { submissionDate: 'desc' },
      skip: (page - 1) * perPage,
      take: perPage,
    });
    
    const formattedLeads = leads.map(lead => ({
      ...lead,
      submissionDate: new Date(lead.submissionDate).toLocaleString(),
      isHomeOwner: lead.isHomeOwner ? 'Yes' : 'No',
      hasRealtorContract: lead.hasRealtorContract ? 'Yes' : 'No',
    }));
    
    return { success: true, leads: formattedLeads, totalCount };
  } catch (error) {
    console.error('Error fetching leads:', error);
    return { success: false, error: 'Failed to fetch leads' };
  }
}

export async function importLeads(formData: FormData) {
  try {
    const file = formData.get('file') as File;
    const content = await file.text();
    const records = parse(content, { columns: true, skip_empty_lines: true });

    for (const record of records) {
      await prisma.lead.create({
        data: {
          leadId: generateLeadId(),
          firstName: record.firstName || '',
          lastName: record.lastName || '',
          phoneNumber: record.phoneNumber || '',
          emailAddress: record.emailAddress || '',
          propertyAddress: record.propertyAddress || '',
          city: record.city || '',
          state: record.state || '',
          zipCode: record.zipCode || '',
          isHomeOwner: record.isHomeOwner?.toLowerCase() === 'yes',
          propertyValue: parseFloat(record.propertyValue) || 0,
          hasRealtorContract: record.hasRealtorContract?.toLowerCase() === 'yes',
          bedrooms: parseInt(record.bedrooms) || 0,
          bathrooms: parseInt(record.bathrooms) || 0,
          status: record.status || 'pending'
        },
      });
    }

    revalidatePath('/leadgen');
    return { success: true };
  } catch (error) {
    console.error('Error importing leads:', error);
    return { success: false, error: 'Failed to import leads' };
  }
}

export async function exportLeads() {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: { submissionDate: 'desc' },
      select: {
        leadId: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        emailAddress: true,
        propertyAddress: true,
        city: true,
        state: true,
        zipCode: true,
        isHomeOwner: true,
        propertyValue: true,
        hasRealtorContract: true,
        bedrooms: true,
        bathrooms: true,
        status: true,
        submissionDate: true,
      }
    });

    const formattedLeads = leads.map(lead => ({
      ...lead,
      submissionDate: new Date(lead.submissionDate).toLocaleString(),
      isHomeOwner: lead.isHomeOwner ? 'Yes' : 'No',
      hasRealtorContract: lead.hasRealtorContract ? 'Yes' : 'No',
    }));

    const csvData = stringify(formattedLeads, { header: true });
    return { success: true, csv: csvData };
  } catch (error) {
    console.error('Error exporting leads:', error);
    return { success: false, error: 'Failed to export leads' };
  }
}

export async function getLeadGenMetrics() {
  try {
    const totalLeads = await prisma.lead.count();
    const acceptedLeads = await prisma.lead.count({ where: { status: 'accepted' } });
    const rejectedLeads = await prisma.lead.count({ where: { status: 'rejected' } });
    const noCoverageLeads = await prisma.lead.count({ where: { status: 'no_coverage' } });
    const rejectedOverturnedLeads = await prisma.lead.count({ where: { status: 'rejected_overturned' } });

    const metrics = {
      totalLeads,
      acceptedLeads,
      rejectedLeads,
      noCoverageLeads,
      rejectedOverturnedLeads,
      conversionRate: acceptedLeads / totalLeads,
    };

    return { success: true, metrics };
  } catch (error) {
    console.error('Error fetching lead gen metrics:', error);
    return { success: false, error: 'Failed to fetch lead gen metrics' };
  }
}
