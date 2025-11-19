import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import { Users } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

interface MemberStatusChartProps {
  distribution: { active: number, expired: number, pending: number };
  isLoading: boolean;
}

// Colors corresponding to Active, Pending, Expired
const COLORS = ['#10b981', '#f59e0b', '#ef4444']; 

const CustomTooltip = ({ active, payload, t }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="p-2 bg-card border rounded-md shadow-lg text-sm">
        <p className="font-semibold">{t(data.name)}</p>
        <p>{t("count")}: {data.value}</p>
        <p>{t("percentage")}: {data.percent ? (data.percent * 100).toFixed(1) : 0}%</p>
      </div>
    );
  }
  return null;
};

const MemberStatusChart: React.FC<MemberStatusChartProps> = ({ distribution, isLoading }) => {
  const { t } = useTranslation();
  
  const totalMembers = distribution.active + distribution.expired + distribution.pending;

  const data = [
    { name: 'Active', value: distribution.active, percent: distribution.active / totalMembers },
    { name: 'Pending', value: distribution.pending, percent: distribution.pending / totalMembers },
    { name: 'Expired', value: distribution.expired, percent: distribution.expired / totalMembers },
  ].filter(item => item.value > 0); // Only show segments with members

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="h-5 w-5 text-primary" /> {t("member_status_distribution")}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex items-center justify-center p-0">
        {isLoading ? (
            <Skeleton className="h-[300px] w-full" />
        ) : totalMembers === 0 ? (
            <div className="text-center text-muted-foreground py-8">
                {t("no_members_found")}
            </div>
        ) : (
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                            labelLine={false}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip t={t} />} />
                        <Legend 
                            layout="horizontal" 
                            verticalAlign="bottom" 
                            align="center" 
                            formatter={(value) => t(value)}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MemberStatusChart;