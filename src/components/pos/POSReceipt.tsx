import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { formatCurrency } from '@/utils/currency-utils';
import { Transaction } from '@/types/supabase';
import { cn } from '@/lib/utils';
import { Dumbbell } from 'lucide-react'; // Import Dumbbell icon

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
    <div className={cn("w-full p-6 bg-white text-gray-900 border border-gray-300 rounded-lg shadow-xl print:shadow-none print:border-0 print:p-0", className)}>
      
      {/* Header with Logo */}
      <div className="text-center border-b pb-4 mb-4">
        <div className="flex items-center justify-center mb-2">
            <Dumbbell className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-extrabold text-gray-900 ml-2">{t("app_title")}</h1>
        </div>
        <p className="text-sm text-gray-600">{t("daily_sales_invoice")}</p>
        <p className="text-xs text-gray-500 mt-1">{t("date")}: {today}</p>
      </div>

      {/* 1. Financial Summary */}
      <div className="space-y-2 mb-6 border-b pb-4">
        <h2 className="text-lg font-bold mb-2">{t("sales_summary")}</h2>
        
        <div className="flex justify-between text-xl font-extrabold pt-2 border-t border-dashed">
          <span>{t("total_revenue")}</span>
          <span className="text-green-600">{formatCurrency(summary.dailyTotal)}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="font-medium text-gray-600">{t("daily_transaction_count")}</span>
          <span className="font-bold">{dailyBreakdowns.count}</span>
        </div>
      </div>

      {/* 2. Detailed Breakdowns (Payment/Type) */}
      {dailyBreakdowns.count > 0 && (
        <div className="space-y-6 mb-6 border-b pb-4">
          
          {/* Payment Breakdown */}
          <div>
            <h3 className="text-base font-bold border-b pb-1 mb-2">{t("payment_method_breakdown")}</h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
              {Object.entries(dailyBreakdowns.paymentBreakdown).map(([method, total]) => (
                <div key={method} className="flex justify-between col-span-1">
                  <span className="text-gray-600">{t(method.toLowerCase())}</span>
                  <span className="font-medium">{formatCurrency(total)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Type Breakdown */}
          <div>
            <h3 className="text-base font-bold border-b pb-1 mb-2">{t("transaction_type_breakdown")}</h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
              {Object.entries(dailyBreakdowns.typeBreakdown).map(([type, total]) => (
                <div key={type} className="flex justify-between col-span-1">
                  <span className="text-gray-600">{t(type.replace(/\s/g, '_').toLowerCase())}</span>
                  <span className="font-medium">{formatCurrency(total)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* 3. Individual Transactions List (Optimized to use Table) */}
      <div className="space-y-4 mb-6">
        <h2 className="text-lg font-bold border-b pb-1 mb-2">{t("daily_transactions_list")}</h2>
        
        {summary.dailyTransactions.length > 0 ? (
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-300 text-left font-semibold text-gray-700">
                <th className="py-1 w-1/3">{t("member")}</th>
                <th className="py-1 w-1/3">{t("type")}</th>
                <th className="py-1 w-1/3 text-right">{t("amount")}</th>
              </tr>
            </thead>
            <tbody>
              {summary.dailyTransactions.map((tx) => (
                <tr key={tx.id} className="border-b border-gray-100 last:border-b-0">
                  <td className="py-1">
                    <p className="font-medium truncate">{tx.member_name}</p>
                    <p className="text-xs text-gray-500 truncate">{tx.item_description}</p>
                  </td>
                  <td className="py-1 text-xs">
                    {t(tx.type.replace(/\s/g, '_').toLowerCase())}
                  </td>
                  <td className="py-1 font-bold text-green-600 text-right">
                    {formatCurrency(tx.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-center text-gray-500 text-sm">{t("no_sales_today")}</p>
        )}
      </div>

      {/* Footer */}
      <div className="text-center pt-4 mt-4 border-t">
        <p className="text-xs text-gray-500">{t("thank_you_for_using_pos")}</p>
      </div>
    </div>
  );
};

export default POSReceipt;