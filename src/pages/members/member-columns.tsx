import { ColumnDef } from "@tanstack/react-table";
import { Member } from "@/data/members";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Eye } from "lucide-react";
import { format } from "date-fns";

// Define a type for the action handler passed from the parent component
type MemberActionHandler = (member: Member) => void;

export const createMemberColumns = (onViewMember: MemberActionHandler): ColumnDef<Member>[] => [
  {
    accessorKey: "id",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          ID
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
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "plan",
    header: "Plan",
  },
  {
    accessorKey: "expirationDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Expires
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
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as Member['status'];
      const variant = status === 'Active' ? 'default' : 'destructive';
      return <Badge variant={variant}>{status}</Badge>;
    },
  },
  {
    id: "actions",
    enableHiding: false,
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