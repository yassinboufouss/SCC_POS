import React from 'react';
import { MembershipPlan } from '@/types/supabase';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, DollarSign, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PlanActions from './PlanActions';
import { formatCurrency } from '@/utils/currency-utils';

interface PlanTableProps {
    plans: MembershipPlan[];
}

const PlanTable: React.FC<PlanTableProps> = ({ plans }) => {
  const { t } = useTranslation();
  
  // Filtering and sorting is handled by the usePlans hook in the parent page.

  return (
    <div className="space-y-4">
      {/* Search input is now in the parent page */}
      
      <div className="overflow-x-auto border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">{t("id")}</TableHead>
              <TableHead>{t("plan_name")}</TableHead>
              <TableHead className="w-[120px] text-center">{t("duration")}</TableHead>
              <TableHead className="w-[120px] text-right">{t("price")}</TableHead>
              <TableHead>{t("description_label")}</TableHead>
              <TableHead className="text-right">{t("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plans.length > 0 ? (
              plans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell className="font-medium text-xs">{plan.id.substring(0, 8)}...</TableCell>
                  <TableCell className="font-semibold">{plan.name}</TableCell>
                  <TableCell className="text-center flex items-center justify-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {plan.duration_days} {t("days")}
                  </TableCell>
                  <TableCell className="text-right font-bold text-primary flex items-center justify-end gap-1">
                    <DollarSign className="h-4 w-4" />
                    {formatCurrency(plan.price)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs truncate">{plan.description}</TableCell>
                  <TableCell className="text-right">
                    <PlanActions plan={plan} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      {t("no_plans_found")}
                  </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default PlanTable;