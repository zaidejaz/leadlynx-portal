'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { getRealtors, getSalesSummary } from '../actions'
import { toast } from "sonner"
import { Sidebar } from './Sidebar'
import { AddRealtorForm } from './AddRealtorForm'
import { RealtorTable } from './RealtorTable'
import { SalesSummary } from './SalesSummary'
import { Realtor, SalesSummary as SalesSummaryType } from '../types'

const REALTORS_PER_PAGE = 10;

export default function SalesDashboard() {
    const [realtors, setRealtors] = useState<Realtor[]>([])
    const [salesSummary, setSalesSummary] = useState<SalesSummaryType | null>(null)
    const [activeView, setActiveView] = useState<'add' | 'view' | 'summary'>('add')
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const { data: session, status } = useSession()
    const router = useRouter()
  
    useEffect(() => {
      if (status === 'unauthenticated') {
        router.push('/login')
      } else if (status === 'authenticated' && session?.user?.role !== 'sales') {
        router.push('/unauthorized')
      } else if (status === 'authenticated') {
        fetchRealtors()
        fetchSalesSummary()
      }
    }, [status, session, router, currentPage])
  
    const fetchRealtors = async () => {
      try {
        const result = await getRealtors(currentPage, REALTORS_PER_PAGE)
        if (result.success) {
          setRealtors(result.realtors)
          setTotalPages(Math.ceil(result.totalCount / REALTORS_PER_PAGE))
        } else {
          throw new Error(result.error)
        }
      } catch (err) {
        console.error('Error fetching realtors:', err)
        toast.error("Failed to fetch realtors. Please try again later.")
      }
    }
  
    const fetchSalesSummary = async (startDate: string, endDate: string) => {
      try {
        const summary = await getSalesSummary(startDate, endDate)
        setSalesSummary(summary)
      } catch (err) {
        console.error('Error fetching sales summary:', err)
        toast.error("Failed to fetch sales summary. Please try again later.")
        setSalesSummary(null)
      }
    }
  
    const handlePageChange = (page: number) => {
      setCurrentPage(page)
    }

    if (!session || session.user.role !== 'sales') {
      return null
    }
  
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar activeView={activeView} setActiveView={setActiveView} />
        <div className="flex-1 p-8 overflow-auto">
          {activeView === 'add' && <AddRealtorForm onRealtorAdded={fetchRealtors} />}
          {activeView === 'view' && (
            <RealtorTable 
              realtors={realtors}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
          {activeView === 'summary' && (
            <SalesSummary 
              salesSummary={salesSummary}
              onDateChange={fetchSalesSummary}
            />
          )}
        </div>
      </div>
    )
}