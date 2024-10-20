import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { SalesSummary as SalesSummaryType } from '../types'

interface SalesSummaryProps {
  salesSummary: SalesSummaryType | null
  onDateChange: (startDate: string, endDate: string) => void
}

export const SalesSummary: React.FC<SalesSummaryProps> = ({ salesSummary, onDateChange }) => {
  const [startDate, setStartDate] = useState<string>(new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0])
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0])

  useEffect(() => {
    onDateChange(startDate, endDate)
  }, [])

  const handleDateChange = () => {
    onDateChange(startDate, endDate)
  }

  if (!salesSummary) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sales Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p>No data available for the selected date range.</p>
        </CardContent>
      </Card>
    )
  }

  const chartData = [
    { name: 'Monthly', value: salesSummary.monthly, revenue: salesSummary.monthly * 80 },
    { name: 'Individual', value: salesSummary.individual, revenue: salesSummary.individual * 299 },
    { name: 'Individual Pro', value: salesSummary.individualPro, revenue: salesSummary.individualPro * 499 },
    { name: 'Team', value: salesSummary.team, revenue: salesSummary.team * 4399 },
    { name: 'Brokerage', value: salesSummary.brokerage, revenue: salesSummary.brokerage * 10999 },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-4 mb-4">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <Button onClick={handleDateChange}>Update</Button>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
            <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="value" name="Count" fill="#8884d8" />
            <Bar yAxisId="right" dataKey="revenue" name="Revenue" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 text-right">
          <strong>Total Revenue: ${salesSummary.totalRevenue}</strong>
        </div>
      </CardContent>
    </Card>
  )
}