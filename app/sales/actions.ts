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
    createdById: session.user.id
  }

  try {
    await prisma.realtor.create({ data: realtorData })

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

export async function getRealtors() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'sales' || !session.user.id) {
    throw new Error('Unauthorized')
  }

  try {
    const realtors = await prisma.realtor.findMany({
      where: { createdById: session.user.id },
      orderBy: { createdAt: 'desc' },
    })

    const users = await prisma.user.findMany({
      where: { email: { in: realtors.map(r => r.emailAddress) } },
      select: { email: true, isActive: true },
    })

    return realtors.map(realtor => ({
      ...realtor,
      isActive: users.find(user => user.email === realtor.emailAddress)?.isActive ?? false,
    }))
  } catch (error) {
    console.error('Error fetching realtors:', error)
    throw new Error('Failed to fetch realtors')
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
      individual: 0,
      team: 0,
      totalRevenue: 0,
    }

    realtors.forEach(realtor => {
      if (realtor.signUpCategory === 'individual') {
        summary.individual++
        summary.totalRevenue += 299
      } else if (realtor.signUpCategory === 'team') {
        summary.team++
        summary.totalRevenue += 499
      }
    })

    return summary
  } catch (error) {
    console.error('Error fetching sales summary:', error)
    throw new Error('Failed to fetch sales summary')
  }
}