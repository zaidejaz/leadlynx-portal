// utils/backgroundTasks.ts
import { PrismaClient, Lead, Realtor } from '@prisma/client';
import { createNotification } from './notifications';

const prisma = new PrismaClient();

async function checkLeadCoverage() {
  const acceptedLeads = await prisma.lead.findMany({
    where: { status: 'accepted' },
    include: { assignments: true }
  });

  for (const lead of acceptedLeads) {
    const realtorInArea = await prisma.realtor.findFirst({
      where: {
        zipCodes: { has: lead.zipCode },
        isActive: true
      }
    });

    if (!realtorInArea && lead.assignments.length === 0) {
      await prisma.lead.update({
        where: { id: lead.id },
        data: { status: 'no_coverage' }
      });

      await createNotification(`Lead ${lead.leadId} has been updated to No-coverage because of no realtor in that area`);
    }
  }
}

async function checkRealtorCoverage() {
  const activeRealtors = await prisma.realtor.findMany({
    where: { isActive: true }
  });

  for (const realtor of activeRealtors) {
    const noCoverageLeads = await prisma.lead.findMany({
      where: {
        status: 'no_coverage',
        zipCode: { in: realtor.zipCodes }
      }
    });

    for (const lead of noCoverageLeads) {
      await prisma.lead.update({
        where: { id: lead.id },
        data: { status: 'accepted' }
      });

      await createNotification(`${realtor.agentCode} covers this area and Lead ${lead.leadId} is set to accepted`);
    }
  }
}

export async function runBackgroundTasks() {
  try {
    await checkLeadCoverage();
    await checkRealtorCoverage();
  } catch (error) {
    console.error('Error running background tasks:', error);
  }
}