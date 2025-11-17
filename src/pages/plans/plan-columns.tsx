import { ColumnDef } from "@tanstack/react-table";
import { MembershipPlan } from "@/data/membership-plans";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Pencil, Clock } from "lucide-react";

// Define a type for the action handler passed from the parent component
type PlanActionHandler = (plan: MembershipPlan) => void;

export const createPlanColumns = (onEditPlan: PlanActionHandler): ColumnDef<MembershipPlan>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Plan Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "price",
    header: ({ column }) => {
      return (
        <div className="text-right">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Price
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      const price: number = row.getValue("price");
      return <div className="text-right font-semibold text-primary">${price.toFixed(2)}</div>;
    },
  },
  {
    accessorKey: "durationDays",
    header: ({ column }) => {
      return (
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Duration
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      const duration: number = row.getValue("durationDays");
      return (
        <div className="text-center">
          <Badge variant="secondary" className="flex items-center justify-center mx-auto w-24">
            <Clock className="h-3 w-3 mr-1" /> {duration} Days
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => <div className="text-muted-foreground text-sm max-w-xs truncate">{row.getValue("description")}</div>,
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const plan = row.original;

      return (
        <div className="text-right">
            <Button variant="outline" size="sm" onClick={() => onEditPlan(plan)}>
                <Pencil className="h-4 w-4" />
            </Button>
        </div>
      );
    },
  },
];