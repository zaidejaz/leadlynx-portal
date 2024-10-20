'use server'

import { PrismaClient } from '@prisma/client'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options"

const prisma = new PrismaClient()

export async function getAllSalesSummary(startDate: string | null, endDate: string | null) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    throw new Error('Unauthorized')
  }

  try {
    const whereClause: any = {}

    if (startDate) {
      whereClause.createdAt = {
        ...(whereClause.createdAt || {}),
        gte: new Date(startDate)
      }
    }

    if (endDate) {
      whereClause.createdAt = {
        ...(whereClause.createdAt || {}),
        lte: new Date(endDate)
      }
    }

    const realtors = await prisma.realtor.findMany({
      where: whereClause,
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          }
        }
      }
    })

    const summary = {
      monthly: 0,
      individual: 0,
      individualPro: 0,
      team: 0,
      brokerage: 0,
      totalRevenue: 0,
      dailyData: {} as { [key: string]: { [key: string]: number } },
      salesPeople: {} as { [key: string]: { name: string, total: number } }
    }

    realtors.forEach(realtor => {
      const dateKey = realtor.createdAt.toISOString().split('T')[0]
      if (!summary.dailyData[dateKey]) {
        summary.dailyData[dateKey] = {
          monthly: 0,
          individual: 0,
          individualPro: 0,
          team: 0,
          brokerage: 0,
          totalRevenue: 0
        }
      }

      let revenue = 0
      switch (realtor.signUpCategory) {
        case 'monthly':
          summary.monthly++
          revenue = 80
          summary.dailyData[dateKey].monthly++
          break
        case 'individual':
          summary.individual++
          revenue = 299
          summary.dailyData[dateKey].individual++
          break
        case 'individualPro':
          summary.individualPro++
          revenue = 499
          summary.dailyData[dateKey].individualPro++
          break
        case 'team':
          summary.team++
          revenue = 4399
          summary.dailyData[dateKey].team++
          break
        case 'brokerage':
          summary.brokerage++
          revenue = 10999
          summary.dailyData[dateKey].brokerage++
          break
      }

      summary.totalRevenue += revenue
      summary.dailyData[dateKey].totalRevenue += revenue

      // Update sales person summary
      const salesPersonId = realtor.createdBy.id
      if (!summary.salesPeople[salesPersonId]) {
        summary.salesPeople[salesPersonId] = {
          name: `${realtor.createdBy.firstName} ${realtor.createdBy.lastName}`,
          total: 0
        }
      }
      summary.salesPeople[salesPersonId].total += revenue
    })

    return summary
  } catch (error) {
    console.error('Error fetching all sales summary:', error)
    throw new Error('Failed to fetch all sales summary')
  }
}
