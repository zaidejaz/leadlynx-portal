// app/realtor/actions.ts
'use server'
import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options"

const prisma = new PrismaClient()

export async function getAssignedLeads() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'realtor' || !session.user.email) {
    throw new Error('Unauthorized')
  }
  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    })

    if (!user) {
      throw new Error('User not found')
    }

    const assignments = await prisma.leadAssignment.findMany({
      where: {
        userId: user.id,
        status: {
          notIn: ['Not interested in selling', 'Resulted in not listing', 'Listed by Homeowner']
        }
      },
      include: {
        lead: true
      }
    })

    return assignments.map(assignment => ({
      id: assignment.id,
      leadId: assignment.leadId,
      prospectName: `${assignment.lead.firstName} ${assignment.lead.lastName}`,
      prospectContact: assignment.lead.phoneNumber || assignment.lead.emailAddress || '',
      propertyAddress: `${assignment.lead.propertyAddress}, ${assignment.lead.city}, ${assignment.lead.state} ${assignment.lead.zipCode}`,
      bedrooms: assignment.lead.bedrooms,
      bathrooms: assignment.lead.bathrooms,
      underAgentContract: assignment.lead.hasRealtorContract,
      status: assignment.status,
      callbackTime: assignment.callbackTime,
      comments: assignment.comments,
    }))
  } catch (error) {
    console.error('Error fetching assigned leads:', error)
    throw new Error('Failed to fetch assigned leads')
  }
}

export async function updateLeadStatus(assignmentId: string, newStatus: string, callbackTime?: Date) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'realtor' || !session.user.email) {
    throw new Error('Unauthorized')
  }
  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    })

    if (!user) {
      throw new Error('User not found')
    }

    if (newStatus === 'Listing Agreement Signed') {
      const assignment = await prisma.leadAssignment.findUnique({
        where: { id: assignmentId },
        select: { leadId: true }
      })
      if (!assignment) throw new Error('Assignment not found')

      await prisma.leadAssignment.deleteMany({
        where: {
          leadId: assignment.leadId,
          id: { not: assignmentId }
        }
      })
      
      await prisma.leadAssignment.update({
        where: { id: assignmentId },
        data: { 
          status: newStatus,
          callbackTime: callbackTime
        }
      })
    } else if (['Not Interested in Selling', 'Resulted in Not Listing', 'Listed by Homeowner'].includes(newStatus)) {
      await prisma.leadAssignment.delete({
        where: { id: assignmentId }
      })
    } else {
      await prisma.leadAssignment.update({
        where: { id: assignmentId },
        data: { 
          status: newStatus,
          callbackTime: callbackTime
        }
      })
    }
    
    revalidatePath('/realtor')
    return { success: true }
  } catch (error) {
    console.error('Error updating lead status:', error)
    return { success: false, error: 'Failed to update lead status' }
  }
}

export async function addLeadComment(assignmentId: string, comment: string) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'realtor' || !session.user.email) {
    throw new Error('Unauthorized')
  }
  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    })

    if (!user) {
      throw new Error('User not found')
    }

    await prisma.leadAssignment.update({
      where: {
        id: assignmentId,
        userId: user.id
      },
      data: {
        comments: comment,
      }
    })
    revalidatePath('/realtor')
    return { success: true }
  } catch (error) {
    console.error('Error adding lead comment:', error)
    return { success: false, error: 'Failed to add lead comment' }
  }
}

export async function setCallbackTime(assignmentId: string, callbackTime: Date) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'realtor' || !session.user.email) {
    throw new Error('Unauthorized')
  }
  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    })

    if (!user) {
      throw new Error('User not found')
    }

    await prisma.leadAssignment.update({
      where: {
        id: assignmentId,
        userId: user.id
      },
      data: {
        callbackTime: callbackTime,
      }
    })
    revalidatePath('/realtor')
    return { success: true }
  } catch (error) {
    console.error('Error setting callback time:', error)
    return { success: false, error: 'Failed to set callback time' }
  }
}