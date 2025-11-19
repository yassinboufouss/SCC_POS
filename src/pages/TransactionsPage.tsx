import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { History, Search, Calendar as CalendarIcon, Filter } from 'lucide-react';
import TransactionsTable from '@/components/transactions/TransactionsTable';
import { useTransactions } from '@/integrations/supabase/data/use-transactions.ts';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Transaction } from '@/types/supabase';
import { PaymentMethod } from '@/types/pos';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';

const transactionTypes: (Transaction['type'] | 'All')[] = ['All', 'Membership', 'POS Sale', 'Mixed Sale'];
const paymentMethods: (PaymentMethod | 'All')[] = ['All', 'Card', 'Cash', 'Transfer'];

const TransactionsPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<Transaction['type'] | 'All'>('All');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<PaymentMethod | 'All'>('All');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  
  const filters = {
    searchTerm,
    typeFilter,
    paymentMethodFilter,
    dateRange: dateRange ? { from: dateRange.from, to: dateRange.to } : undefined,
  };
  
  const { data: transactions, isLoading } = useTransactions(filters);
  const totalTransactions = transactions?.length || 0;

  const handleClearFilters = () => {
    setSearchTerm('');
    setTypeFilter('All');
    setPaymentMethodFilter('All');
    setDateRange(undefined);
  };

  return (
    <Layout>
      <div className="p-4 lg:p-6 space-y-6">
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">{t("transactions")}</h1>
        </div>
        
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" /> {t("transaction_history", { count: totalTransactions })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex flex-wrap items-center gap-4">
                {/* Search Input */}
                <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                    <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                    <Input
                        placeholder={t("search_transactions_by_member")}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-lg"
                    />
                </div>
                
                {/* Type Filter */}
                <Select 
                    value={typeFilter} 
                    onValueChange={(value: Transaction['type'] | 'All') => setTypeFilter(value)}
                >
                    <SelectTrigger className="w-[150px] min-w-[150px]">
                        <SelectValue placeholder={t("filter_by_type")} />
                    </SelectTrigger>
                    <SelectContent>
                        {transactionTypes.map(type => (
                            <SelectItem key={type} value={type}>
                                {t(type.replace(/\s/g, '_').toLowerCase())}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                
                {/* Payment Method Filter */}
                <Select 
                    value={paymentMethodFilter} 
                    onValueChange={(value: PaymentMethod | 'All') => setPaymentMethodFilter(value)}
                >
                    <SelectTrigger className="w-[150px] min-w-[150px]">
                        <SelectValue placeholder={t("filter_by_payment")} />
                    </SelectTrigger>
                    <SelectContent>
                        {paymentMethods.map(method => (
                            <SelectItem key={method} value={method}>
                                {t(method.toLowerCase())}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                
                {/* Date Range Picker */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            id="date"
                            variant={"outline"}
                            className={cn(
                                "w-full md:w-[240px] justify-start text-left font-normal",
                                !dateRange && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateRange?.from ? (
                                dateRange.to ? (
                                    <>
                                        {format(dateRange.from, "LLL dd, y")} -{" "}
                                        {format(dateRange.to, "LLL dd, y")}
                                    </>
                                ) : (
                                    format(dateRange.from, "LLL dd, y")
                                )
                            ) : (
                                <span>{t("pick_a_date_range")}</span>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={dateRange?.from}
                            selected={dateRange}
                            onSelect={setDateRange}
                            numberOfMonths={2}
                        />
                    </PopoverContent>
                </Popover>
                
                {/* Clear Filters Button */}
                {(searchTerm || typeFilter !== 'All' || paymentMethodFilter !== 'All' || dateRange) && (
                    <Button variant="ghost" onClick={handleClearFilters} className="shrink-0">
                        <Filter className="h-4 w-4 mr-2" /> {t("clear_filters")}
                    </Button>
                )}
            </div>
            
            {isLoading ? (
                <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
            ) : (
                <TransactionsTable transactions={transactions || []} />
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default TransactionsPage;