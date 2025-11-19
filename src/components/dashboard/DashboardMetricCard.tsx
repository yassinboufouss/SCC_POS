import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardMetricCardProps {
  title: string;
  value: React.ReactNode;
  icon: LucideIcon;
  description: string;
  className?: string;
}

const DashboardMetricCard: React.FC<DashboardMetricCardProps> = ({ title, value, icon: Icon, description, className }) => {
  return (
    <Card className={cn("transition-shadow shadow-sm hover:shadow-lg", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );
};

export default DashboardMetricCard;