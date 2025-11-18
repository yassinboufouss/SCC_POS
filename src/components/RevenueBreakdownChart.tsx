import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateMonthlyRevenueBreakdown } from '@/utils/dashboard-metrics';
import { useTranslation } from 'react-i18next';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28']; // Blue (Membership), Green (POS Sale), Yellow (Mixed Sale)

const RevenueBreakdownChart = () => {
  const { t } = useTranslation();
  const data = calculateMonthlyRevenueBreakdown();

  const renderCustomizedLabel = ({ name, percent }: any) => {
    if (percent * 100 < 5) return null; // Hide labels for very small slices
    return `${name}: ${(percent * 100).toFixed(0)}%`;
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{t("revenue_breakdown_mtd")}</CardTitle>
      </CardHeader>
      <CardContent className="h-80 p-4">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="amount"
                nameKey="type"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                labelLine={false}
                label={renderCustomizedLabel}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  borderColor: 'hsl(var(--border))', 
                  borderRadius: '0.5rem' 
                }}
                formatter={(value: number, name: string) => [`$${value.toFixed(2)}`, name]}
              />
              <Legend layout="horizontal" verticalAlign="bottom" align="center" iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            {t("no_revenue_data_this_month")}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RevenueBreakdownChart;