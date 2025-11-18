import React, { useState, useMemo } from 'react';
import { MembershipPlan, membershipPlans } from '@/data/membership-plans';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Search, DollarSign, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PlanActions from './PlanActions.tsx';

const PlanTable: React.FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  // Use state to hold the list, so updates from forms trigger re-render
  const [plans, setPlans] = useState<MembershipPlan[]>(membershipPlans);

  const filteredPlans = useMemo(() => {
    // Sort by duration days ascending
    const sortedPlans = [...plans].sort((a, b) => a.durationDays - b.durationDays);
    
    if (!searchTerm) {
      return sortedPlans;
    }
    const lowerCaseSearch = searchTerm.toLowerCase();
    return sortedPlans.filter(plan =>
      plan.name.toLowerCase().includes(lowerCaseSearch) ||
      plan.description.toLowerCase().includes(lowerCaseSearch) ||
      plan.id.toLowerCase().includes(lowerCaseSearch)
    );
  }, [searchTerm, plans]);
  
  const handlePlanUpdate = (updatedPlan: MembershipPlan) => {
    // Update the local state to reflect changes
    setPlans(prevPlans => prevPlans.map(p => p.id === updatedPlan.id ? updatedPlan : p));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
              placeholder={t("search_plans_by_name")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
          />
      </div>
      
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
            {filteredPlans.length > 0 ? (
              filteredPlans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell className="font-medium text-xs">{plan.id}</TableCell>
                  <TableCell className="font-semibold">{plan.name}</TableCell>
                  <TableCell className="text-center flex items-center justify-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {plan.durationDays} {t("days")}
                  </TableCell>
                  <TableCell className="text-right font-bold text-primary flex items-center justify-end gap-1">
                    <DollarSign className="h-4 w-4" />
                    {plan.price.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs truncate">{plan.description}</TableCell>
                  <TableCell className="text-right">
                    <PlanActions plan={plan} onUpdate={handlePlanUpdate} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      {t("no_products_found", { term: searchTerm })}
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