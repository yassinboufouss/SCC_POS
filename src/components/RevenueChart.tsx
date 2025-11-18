import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from 'react-i18next';

const data = [
  { name: 'Jan', Revenue: 25000 },
  { name: 'Feb', Revenue: 28000 },
  { name: 'Mar', Revenue: 32000 },
  { name: 'Apr', Revenue: 35000 },
  { name: 'May', Revenue: 40000 },
  { name: 'Jun', Revenue: 45231 },
];

const RevenueChart = () => {
  const { t } = useTranslation();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("monthly_revenue_trend")}</CardTitle>
      </CardHeader>
      <CardContent className="h-80 p-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="name" stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis 
              stroke="hsl(var(--foreground))" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
              tickFormatter={(value) => `$${value / 1000}k`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                borderColor: 'hsl(var(--border))', 
                borderRadius: '0.5rem' 
              }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, t('revenue')]}
            />
            <Bar dataKey="Revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default RevenueChart;