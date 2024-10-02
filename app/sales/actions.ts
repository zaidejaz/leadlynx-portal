"use server";
import { PrismaClient, Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import crypto from 'crypto'

const prisma = new PrismaClient()

type RealtorCreateInput = Prisma.RealtorCreateInput
type UserCreateInput = Prisma.UserCreateInput

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex')
}

export async function submitRealtorInfo(formData: FormData) {
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (password !== confirmPassword) {
    return { success: false, error: 'Passwords do not match' }
  }

  const hashedPassword = hashPassword(password)

  const realtorData: RealtorCreateInput = {
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
  }

  try {
    await prisma.realtor.create({ data: realtorData })
    
    const userData: UserCreateInput = {
      email: realtorData.emailAddress,
      password: hashedPassword,
      firstName: realtorData.firstName,
      lastName: realtorData.lastName,
      role: 'realtor',
      isActive: false, // Initially inactive
    }

    await prisma.user.create({ data: userData })

    revalidatePath('/sales')
    return { success: true }
  } catch (error) {
    console.error('Error submitting realtor information:', error)
    return { success: false, error: 'Failed to submit realtor information' }
  }
}

export async function getRealtors() {
  try {
    const realtors = await prisma.realtor.findMany({
      orderBy: { createdAt: 'desc' },
    })

    const users = await prisma.user.findMany({
      where: { role: 'realtor' },
      select: { email: true, isActive: true },
    })

    const result = realtors.map(realtor => ({
      ...realtor,
      isActive: users.find(user => user.email === realtor.emailAddress)?.isActive ?? false,
    }))

    return result
  } catch (error) {
    console.error('Error fetching realtors:', error)
    throw new Error('Failed to fetch realtors')
  }
}
