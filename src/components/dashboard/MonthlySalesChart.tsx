import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import { DollarSign, TrendingUp } from 'lucide-react';
import { MonthlySalesData } from '@/utils/transaction-utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/utils/currency-utils';
import { Skeleton } from '@/components/ui/skeleton';

interface MonthlySalesChartProps {
  data: MonthlySalesData[];
  isLoading: boolean;
}

const CustomTooltip = ({ active, payload, label, t }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-card border rounded-md shadow-lg text-sm">
        <p className="font-semibold text-muted-foreground">{label}</p>
        <p className="text-primary">{t("revenue")}: {formatCurrency(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};

const MonthlySalesChart: React.FC<MonthlySalesChartProps> = ({ data, isLoading }) => {
  const { t } = useTranslation();

  return (
    <Card className="lg:col-span-2 h-[400px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="h-5 w-5 text-blue-500" /> {t("monthly_revenue_trend")}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        {isLoading ? (
            <Skeleton className="h-full w-full" />
        ) : (
            <div className="h-full w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                        <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                        <YAxis 
                            stroke="hsl(var(--muted-foreground))" 
                            tickFormatter={(value) => formatCurrency(value).split(' ')[0]}
                        />
                        <Tooltip content={<CustomTooltip t={t} />} />
                        <Bar 
                            dataKey="revenue" 
                            fill="hsl(var(--primary))" 
                            radius={[4, 4, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MonthlySalesChart;