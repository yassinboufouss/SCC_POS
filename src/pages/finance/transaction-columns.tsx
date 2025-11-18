import { ColumnDef } from "@tanstack/react-table";
import { Transaction } from "@/data/transactions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, DollarSign, CreditCard, Receipt } from "lucide-react";
import { useTranslation } from "react-i18next";

const getPaymentIcon = (method: string) => {
  switch (method) {
    case 'Card':
      return <CreditCard className="h-4 w-4 text-blue-500" />;
    case 'Cash':
      return <DollarSign className="h-4 w-4 text-green-500" />;
    case 'Transfer':
      return <Receipt className="h-4 w-4 text-orange-500" />;
    default:
      return null;
  }
};

export const transactionColumns: ColumnDef<Transaction>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { t } = useTranslation();
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t("id")}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="font-mono text-xs">{row.getValue("id")}</div>,
  },
  {
    accessorKey: "date",
    header: ({ column }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { t } = useTranslation();
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t("date")}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "memberName",
    header: () => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { t } = useTranslation();
      return t("member_customer");
    },
  },
  {
    accessorKey: "type",
    header: () => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { t } = useTranslation();
      return t("type");
    },
    cell: ({ row }) => {
      const type = row.getValue("type") as Transaction['type'];
      const variant = type === 'Membership' ? 'default' : 'secondary';
      return <Badge variant={variant}>{type}</Badge>;
    },
  },
  {
    accessorKey: "item",
    header: () => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { t } = useTranslation();
      return t("item_description");
    },
    cell: ({ row }) => <div className="text-sm text-muted-foreground max-w-xs truncate">{row.getValue("item")}</div>,
  },
  {
    accessorKey: "amount",
    header: ({ column }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { t } = useTranslation();
      return (
        <div className="text-right">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t("amount")}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      const amount: number = row.getValue("amount");
      return <div className="text-right font-semibold text-green-600">+${amount.toFixed(2)}</div>;
    },
  },
  {
    accessorKey: "paymentMethod",
    header: () => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { t } = useTranslation();
      return t("payment");
    },
    cell: ({ row }) => {
      const method = row.getValue("paymentMethod") as Transaction['paymentMethod'];
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { t } = useTranslation();
      return (
        <div className="flex items-center justify-center gap-1">
          {getPaymentIcon(method)}
          <span className="text-xs">{t(method.toLowerCase())}</span>
        </div>
      );
    },
  },
];