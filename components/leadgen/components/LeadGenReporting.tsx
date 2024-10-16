'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getLeadGenMetrics } from '../actions';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface LeadGenMetrics {
  totalLeads: number;
  acceptedLeads: number;
  rejectedLeads: number;
  noCoverageLeads: number;
  rejectedOverturnedLeads: number;
  conversionRate: number;
}

export function LeadGenReporting() {
  const [metrics, setMetrics] = useState<LeadGenMetrics | null>(null);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    const result = await getLeadGenMetrics();
    if (result.success) {
      setMetrics(result.metrics);
    } else {
      console.error('Failed to fetch lead gen metrics');
    }
  };

  if (!metrics) {
    return <div>Loading metrics...</div>;
  }

  const chartData = [
    { name: 'Accepted', value: metrics.acceptedLeads },
    { name: 'Rejected', value: metrics.rejectedLeads },
    { name: 'No Coverage', value: metrics.noCoverageLeads },
    { name: 'Rejected Overturned', value: metrics.rejectedOverturnedLeads },
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Lead Generation Metrics</CardTitle>
      </CardHeader>
      <CardContent>
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
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}