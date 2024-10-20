'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getLeadGenMetrics } from '../actions';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface LeadGenMetrics {
  totalLeads: number;
  acceptedLeads: number;
  rejectedLeads: number;
  noCoverageLeads: number;
  rejectedOverturnedLeads: number;
  conversionRate: number;
  dailyMetrics: {
    date: string;
    totalLeads: number;
    acceptedLeads: number;
    rejectedLeads: number;
    noCoverageLeads: number;
    rejectedOverturnedLeads: number;
  }[];
}

export function LeadGenReporting() {
  const [metrics, setMetrics] = useState<LeadGenMetrics | null>(null);
  const [startDate, setStartDate] = useState<string>(
    new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Fetching metrics for date range:', startDate, 'to', endDate);
      const result = await getLeadGenMetrics(new Date(startDate), new Date(endDate));
      console.log('Received result:', result);
      if (result.success && result.metrics) {
        setMetrics(result.metrics);
      } else {
        throw new Error(result.error || 'Failed to fetch lead gen metrics');
      }
    } catch (err) {
      console.error('Error fetching metrics:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      toast.error('Failed to fetch metrics. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div>Loading metrics...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!metrics) {
    return <div>No metrics data available.</div>;
  }

  const aggregateChartData = [
    { name: 'Accepted', value: metrics.acceptedLeads },
    { name: 'Rejected', value: metrics.rejectedLeads },
    { name: 'No Coverage', value: metrics.noCoverageLeads },
    { name: 'Rejected-Overturned', value: metrics.rejectedOverturnedLeads },
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Lead Generation Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4 mb-6">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-40"
          />
          <span>to</span>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-40"
          />
          <Button onClick={fetchMetrics}>Update Metrics</Button>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <h3 className="text-lg font-semibold">Total Leads</h3>
            <p className="text-3xl font-bold">{metrics.totalLeads}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Conversion Rate</h3>
            <p className="text-3xl font-bold">{(metrics.conversionRate * 100).toFixed(2)}%</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Rejected Overturned</h3>
            <p className="text-3xl font-bold">{metrics.rejectedOverturnedLeads}</p>
          </div>
        </div>
        <div className="h-80 w-full mb-8">
          <h3 className="text-lg font-semibold mb-4">Aggregate Metrics</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={aggregateChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="h-80 w-full">
          <h3 className="text-lg font-semibold mb-4">Daily Metrics</h3>
          {metrics.dailyMetrics && metrics.dailyMetrics.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.dailyMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="totalLeads" fill="#8884d8" />
                <Bar dataKey="acceptedLeads" fill="#82ca9d" />
                <Bar dataKey="rejectedLeads" fill="#ffc658" />
                <Bar dataKey="noCoverageLeads" fill="#ff8042" />
                <Bar dataKey="rejectedOverturnedLeads" fill="#ff0000" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p>No daily metrics data available for the selected date range.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}