import { ColumnDef } from "@tanstack/react-table";
import { Member } from "@/data/members";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Eye } from "lucide-react";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";

// Define a type for the action handler passed from the parent component
type MemberActionHandler = (member: Member) => void;

export const createMemberColumns = (onViewMember: MemberActionHandler): ColumnDef<Member>[] => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { t } = useTranslation();
  
  return [
    {
      accessorKey: "id",
      header: ({ column }) => {
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
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t("name")}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    },
    {
      accessorKey: "plan",
      header: t("plan"),
    },
    {
      accessorKey: "expirationDate",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t("expires")}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
          const date: string = row.getValue("expirationDate");
          return format(new Date(date), 'MMM dd, yyyy');
      }
    },
    {
      accessorKey: "status",
      header: t("status"),
      cell: ({ row }) => {
        const status = row.getValue("status") as Member['status'];
        const variant = status === 'Active' ? 'default' : 'destructive';
        return <Badge variant={variant}>{status}</Badge>;
      },
    },
    {
      id: "actions",
      enableHiding: false,
      header: t("actions"),
      cell: ({ row }) => {
        const member = row.original;

        return (
          <div className="text-right">
              <Button variant="outline" size="sm" onClick={() => onViewMember(member)}>
                  <Eye className="h-4 w-4" />
              </Button>
          </div>
        );
      },
    },
  ];
};