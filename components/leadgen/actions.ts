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
    const skip = (page - 1) * perPage;
    const totalCount = await prisma.lead.count();
    
    const leads = await prisma.lead.findMany({
      orderBy: { submissionDate: 'desc' },
      skip: skip,  // Make sure this is being used
      take: perPage,
    });
    
    return { 
      success: true, 
      leads, 
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / perPage)
    };

    
  } catch (error) {
    console.error('Error fetching leads:', error);
    return { success: false, error: 'Failed to fetch leads' };
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

export async function getLeadGenMetrics(startDate: Date, endDate: Date) {
  try {
    // Fetch metrics from your database based on the date range
    const metrics = await prisma.lead.groupBy({
      by: ['status', 'submissionDate'],
      where: {
        submissionDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: {
        id: true,
      },
    });

    // Process the metrics to calculate daily and aggregate values
    const dailyMetrics = {};
    let totalLeads = 0;
    let acceptedLeads = 0;
    let rejectedLeads = 0;
    let noCoverageLeads = 0;
    let rejectedOverturnedLeads = 0;

    metrics.forEach((metric) => {
      const date = metric.submissionDate.toISOString().split('T')[0];
      if (!dailyMetrics[date]) {
        dailyMetrics[date] = {
          date,
          totalLeads: 0,
          acceptedLeads: 0,
          rejectedLeads: 0,
          noCoverageLeads: 0,
          rejectedOverturnedLeads: 0,
        };
      }

      dailyMetrics[date].totalLeads += metric._count.id;
      totalLeads += metric._count.id;

      switch (metric.status) {
        case 'accepted':
          dailyMetrics[date].acceptedLeads += metric._count.id;
          acceptedLeads += metric._count.id;
          break;
        case 'rejected':
          dailyMetrics[date].rejectedLeads += metric._count.id;
          rejectedLeads += metric._count.id;
          break;
        case 'no_coverage':
          dailyMetrics[date].noCoverageLeads += metric._count.id;
          noCoverageLeads += metric._count.id;
          break;
        case 'rejected_overturned':
          dailyMetrics[date].rejectedOverturnedLeads += metric._count.id;
          rejectedOverturnedLeads += metric._count.id;
          break;
      }
    });

    const conversionRate = totalLeads > 0 ? acceptedLeads / totalLeads : 0;

    const processedMetrics = {
      totalLeads,
      acceptedLeads,
      rejectedLeads,
      noCoverageLeads,
      rejectedOverturnedLeads,
      conversionRate,
      dailyMetrics: Object.values(dailyMetrics),
    };

    console.log('Processed metrics:', processedMetrics);

    return {
      success: true,
      metrics: processedMetrics,
    };
  } catch (error) {
    console.error('Error fetching lead gen metrics:', error);
    return { success: false, error: 'Failed to fetch lead gen metrics' };
  }
}