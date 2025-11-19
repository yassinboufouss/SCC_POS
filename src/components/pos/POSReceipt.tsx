import React from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { formatCurrency } from '@/utils/currency-utils';
import { Transaction } from '@/types/supabase';
import { cn } from '@/lib/utils';

interface POSReceiptProps {
  summary: {
    dailyTotal: number;
    weeklyTotal: number;
    monthlyTotal: number;
    dailyTransactions: Transaction[];
  };
  dailyBreakdowns: {
    count: number;
    paymentBreakdown: Record<string, number>;
    typeBreakdown: Record<string, number>;
  };
  className?: string;
}

const POSReceipt: React.FC<POSReceiptProps> = ({ summary, dailyBreakdowns, className }) => {
  const { t } = useTranslation();
  const today = format(new Date(), 'yyyy-MM-dd');

  return (
    <div className={cn("p-6 bg-white text-gray-900 border border-gray-300 rounded-lg shadow-xl max-w-md mx-auto print:shadow-none print:border-0 print:p-0", className)}>
      
      {/* Header */}
      <div className="text-center border-b pb-4 mb-4">
        <h1 className="text-2xl font-extrabold text-primary">{t("app_title")}</h1>
        <p className="text-sm text-gray-600">{t("sales_summary")}</p>
        <p className="text-xs text-gray-500 mt-1">{t("date")}: {today}</p>
      </div>

      {/* Summary Metrics */}
      <div className="space-y-2 mb-6">
        <h2 className="text-lg font-bold border-b pb-1 mb-2">{t("daily_sales_total")}</h2>
        
        <div className="flex justify-between text-sm">
          <span className="font-medium">{t("daily_transaction_count")}</span>
          <span className="font-bold">{dailyBreakdowns.count}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="font-medium">{t("total_revenue_mtd")}</span>
          <span className="font-bold">{formatCurrency(summary.monthlyTotal)}</span>
        </div>
        
        <div className="flex justify-between text-xl font-extrabold pt-2 border-t border-dashed">
          <span>{t("total_due")}</span>
          <span className="text-green-600">{formatCurrency(summary.dailyTotal)}</span>
        </div>
      </div>

      {/* Detailed Breakdowns */}
      {dailyBreakdowns.count > 0 && (
        <div className="space-y-6">
          
          {/* Payment Breakdown */}
          <div>
            <h3 className="text-base font-bold border-b pb-1 mb-2">{t("payment_method_breakdown")}</h3>
            <div className="space-y-1 text-sm">
              {Object.entries(dailyBreakdowns.paymentBreakdown).map(([method, total]) => (
                <div key={method} className="flex justify-between">
                  <span className="text-gray-600">{t(method.toLowerCase())}</span>
                  <span className="font-medium">{formatCurrency(total)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Type Breakdown */}
          <div>
            <h3 className="text-base font-bold border-b pb-1 mb-2">{t("transaction_type_breakdown")}</h3>
            <div className="space-y-1 text-sm">
              {Object.entries(dailyBreakdowns.typeBreakdown).map(([type, total]) => (
                <div key={type} className="flex justify-between">
                  <span className="text-gray-600">{t(type.replace(/\s/g, '_').toLowerCase())}</span>
                  <span className="font-medium">{formatCurrency(total)}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* List of Transactions (Top 5 for brevity, or all if few) */}
          <div>
            <h3 className="text-base font-bold border-b pb-1 mb-2">{t("daily_transactions_list")}</h3>
            <div className="space-y-2 text-xs max-h-60 overflow-y-auto">
              {summary.dailyTransactions.slice(0, 10).map((tx, index) => (
                <div key={tx.id} className="border-b border-dashed pb-1">
                  <div className="flex justify-between font-medium">
                    <span>{tx.member_name}</span>
                    <span>{formatCurrency(tx.amount)}</span>
                  </div>
                  <p className="text-gray-500 truncate">{t(tx.type.replace(/\s/g, '_').toLowerCase())} - {tx.payment_method}</p>
                </div>
              ))}
              {summary.dailyTransactions.length > 10 && (
                  <p className="text-center text-gray-500 mt-2">... {t("and_more_transactions", { count: summary.dailyTransactions.length - 10 })}</p>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Footer */}
      <div className="text-center pt-4 mt-4 border-t">
        <p className="text-xs text-gray-500">{t("thank_you_for_using_pos")}</p>
      </div>
    </div>
  );
};

export default POSReceipt;