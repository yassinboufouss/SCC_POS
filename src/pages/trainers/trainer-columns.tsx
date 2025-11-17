import { ColumnDef } from "@tanstack/react-table";
import { Trainer } from "@/data/trainers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Eye, Star } from "lucide-react";

type TrainerActionHandler = (trainer: Trainer) => void;

export const createTrainerColumns = (onViewProfile: TrainerActionHandler): ColumnDef<Trainer>[] => [
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
    accessorKey: "specialty",
    header: "Specialty",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as Trainer['status'];
      const variant = status === 'Active' ? 'default' : 'destructive';
      return <Badge variant={variant}>{status}</Badge>;
    },
  },
  {
    accessorKey: "classesTaught",
    header: ({ column }) => {
      return (
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Classes Taught
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => <div className="text-center">{row.getValue("classesTaught")}</div>,
  },
  {
    accessorKey: "memberRating",
    header: ({ column }) => {
      return (
        <div className="text-right">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Rating
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      const rating: number = row.getValue("memberRating");
      return (
        <div className="text-right flex items-center justify-end gap-1">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          {rating.toFixed(1)}
        </div>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const trainer = row.original;

      return (
        <div className="text-right">
            <Button variant="outline" size="sm" onClick={() => onViewProfile(trainer)}>
                <Eye className="h-4 w-4" />
            </Button>
        </div>
      );
    },
  },
];