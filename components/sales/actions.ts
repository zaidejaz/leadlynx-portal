'use server'

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options"
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function submitRealtorInfo(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'sales' || !session.user.id) {
    throw new Error('Unauthorized')
  }

  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string
  if (password !== confirmPassword) {
    return { success: false, error: 'Passwords do not match' }
  }

  const hashedPassword = await bcrypt.hash(password, 10)
  const zipCodes = (formData.get('zipCodes') as string).split(',').map(zip => zip.trim())

  const realtorData = {
    agentCode: formData.get('agentCode') as string,
    firstName: formData.get('firstName') as string,
    lastName: formData.get('lastName') as string,
    phoneNumber: formData.get('phone') as string,
    emailAddress: formData.get('email') as string,
    brokerage: formData.get('brokerage') as string,
    state: formData.get('state') as string,
    centralZipCode: formData.get('centralZipCode') as string,
    radius: parseInt(formData.get('radius') as string),
    signUpCategory: formData.get('signUpCategory') as string,
    teamMembers: formData.get('teamMembers') ? parseInt(formData.get('teamMembers') as string) : null,
    zipCodes: zipCodes,
    isActive: false,
    contactSigned: false,
    createdById: session.user.id,
  }

  try {
    const createdRealtor = await prisma.realtor.create({ data: realtorData })
    await prisma.user.create({
      data: {
        email: realtorData.emailAddress,
        password: hashedPassword,
        firstName: realtorData.firstName,
        lastName: realtorData.lastName,
        role: 'realtor',
        isActive: false, // Initially inactive
      }
    })
    revalidatePath('/sales')
    return { success: true }
  } catch (error) {
    console.error('Error submitting realtor information:', error)
    return { success: false, error: 'Failed to submit realtor information' }
  }
}

export async function getRealtors(page: number = 1, pageSize: number = 10) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'sales' || !session.user.id) {
    throw new Error('Unauthorized')
  }

  try {
    const skip = (page - 1) * pageSize;
    const [realtors, totalCount] = await Promise.all([
      prisma.realtor.findMany({
        where: { createdById: session.user.id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.realtor.count({ where: { createdById: session.user.id } })
    ]);

    const users = await prisma.user.findMany({
      where: { email: { in: realtors.map(r => r.emailAddress) } },
      select: { email: true, isActive: true },
    })

    const realtorsWithStatus = realtors.map(realtor => ({
      ...realtor,
      isActive: users.find(user => user.email === realtor.emailAddress)?.isActive ?? false,
    }))

    return {
      success: true,
      realtors: realtorsWithStatus,
      totalCount
    }
  } catch (error) {
    console.error('Error fetching realtors:', error)
    return { success: false, error: 'Failed to fetch realtors' }
  }
}

export async function getSalesSummary() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'sales' || !session.user.id) {
    throw new Error('Unauthorized')
  }

  try {
    const realtors = await prisma.realtor.findMany({
      where: { createdById: session.user.id },
    })

    const summary = {
      monthly: 0,
      individual: 0,
      individualPro: 0,
      team: 0,
      brokerage: 0,
      totalRevenue: 0,
    }

    realtors.forEach(realtor => {
      switch (realtor.signUpCategory) {
        case 'monthly':
          summary.monthly++
          summary.totalRevenue += 80
          break
        case 'individual':
          summary.individual++
          summary.totalRevenue += 299
          break
        case 'individualPro':
          summary.individualPro++
          summary.totalRevenue += 499
          break
        case 'team':
          summary.team++
          summary.totalRevenue += 4399
          break
        case 'brokerage':
          summary.brokerage++
          summary.totalRevenue += 10999
          break
      }
    })

    return summary
  } catch (error) {
    console.error('Error fetching sales summary:', error)
    throw new Error('Failed to fetch sales summary')
  }
}