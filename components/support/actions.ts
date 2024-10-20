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
                    },
                    orderBy: { sentDate: 'desc' }
                }
            },
            orderBy: { submissionDate: 'desc' }
        });

        const transformedLeads = await Promise.all(leads.map(async (lead) => {
            const assignmentsWithRealtorInfo = await Promise.all(lead.assignments.map(async (assignment) => {
                const realtorProfile = await prisma.realtor.findUnique({
                    where: { userId: assignment.user.id }
                });

                return {
                    id: assignment.id,
                    agentCode: realtorProfile?.agentCode || 'N/A',
                    realtorFirstName: assignment.user.firstName,
                    realtorLastName: assignment.user.lastName,
                    dateSent: assignment.sentDate.toISOString(),
                    leadId: lead.leadId,
                    comments: assignment.comments,
                    status: assignment.status,
                    callbackTime: assignment.callbackTime ? assignment.callbackTime.toISOString() : null
                };
            }));

            return {
                ...lead,
                assignments: assignmentsWithRealtorInfo
            };
        }));

        return transformedLeads;
    } catch (error) {
        console.error('Error fetching accepted leads:', error);
        throw new Error('Failed to fetch accepted leads');
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
            centralZipCode: realtor.centralZipCode,
            radius: realtor.radius,
            signUpCategory: realtor.signUpCategory,
            zipCodes: realtor.zipCodes,
            isActive: realtor.isActive,
            contactSigned: realtor.contactSigned,
            contractSent: realtor.contractSent
        }))
    } catch (error) {
        console.error('Error fetching realtors:', error)
        throw new Error('Failed to fetch realtors')
    }
}

export async function updateRealtorInfo(realtorId: string, field: string, value: boolean | string) {
    try {
        await prisma.realtor.update({
            where: { id: realtorId },
            data: { [field]: value }
        })

        revalidatePath('/support')
    } catch (error) {
        console.error('Error updating realtor info:', error)
        throw new Error('Failed to update realtor info')
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

export async function updateLeadStatus(leadId: string, newStatus: string) {
    try {
        await prisma.lead.update({
            where: { id: leadId },
            data: { status: newStatus }
        })

        revalidatePath('/support')
    } catch (error) {
        console.error('Error updating lead status:', error)
        throw new Error('Failed to update lead status')
    }
}

export async function getNotifications() {
    try {
        const notifications = await prisma.notification.findMany({
            orderBy: { createdAt: 'desc' },
            take: 20 // Limit to the 20 most recent notifications
        })

        return notifications.map(notification => ({
            id: notification.id,
            message: notification.message,
            createdAt: notification.createdAt.toISOString()
        }))
    } catch (error) {
        console.error('Error fetching notifications:', error)
        throw new Error('Failed to fetch notifications')
    }
}

// This function should be called whenever a new realtor is added or their zip codes are updated
export async function checkAndUpdateLeadStatus() {
    try {
        const noCoverageLeads = await prisma.lead.findMany({
            where: { status: 'No Coverage' }
        })

        for (const lead of noCoverageLeads) {
            const availableRealtor = await prisma.realtor.findFirst({
                where: {
                    OR: [
                        { zipCodes: { has: lead.zipCode } },
                        {
                            AND: [
                                { centralZipCode: lead.zipCode },
                                { radius: { gt: 0 } }
                            ]
                        }
                    ]
                }
            })

            if (availableRealtor) {
                await prisma.lead.update({
                    where: { id: lead.id },
                    data: { status: 'Accepted' }
                })

                await prisma.notification.create({
                    data: {
                        message: `Lead ${lead.leadId} is now covered by realtor ${availableRealtor.firstName} ${availableRealtor.lastName} (${availableRealtor.agentCode}).`
                    }
                })
            }
        }

        revalidatePath('/support')
    } catch (error) {
        console.error('Error checking and updating lead status:', error)
        throw new Error('Failed to check and update lead status')
    }
}