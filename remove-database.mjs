import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteAllData() {
  try {
    // Delete all notifications
    await prisma.notification.deleteMany();
    console.log('Deleted all notifications');

    // Delete all lead assignments
    await prisma.leadAssignment.deleteMany();
    console.log('Deleted all lead assignments');

    // Delete all leads
    await prisma.lead.deleteMany();
    console.log('Deleted all leads');

    // Delete all realtors
    await prisma.realtor.deleteMany();
    console.log('Deleted all realtors');

    // Delete all users
    await prisma.user.deleteMany();
    console.log('Deleted all users');

    console.log('All data has been deleted successfully');
  } catch (error) {
    console.error('Error deleting data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteAllData();