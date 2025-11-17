import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Dumbbell, Star } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { trainers, Trainer } from '@/data/trainers';
import TrainerProfileSheet from '@/components/TrainerProfileSheet';

const TrainersPage = () => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);

  const handleViewProfile = (trainer: Trainer) => {
    setSelectedTrainer(trainer);
    setIsSheetOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Trainer Management</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Trainer
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5" /> Current Staff ({trainers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Specialty</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Classes Taught</TableHead>
                <TableHead className="text-right">Rating</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trainers.map((trainer: Trainer) => {
                const statusVariant = trainer.status === 'Active' ? 'default' : 'destructive';
                return (
                  <TableRow key={trainer.id}>
                    <TableCell className="font-medium">{trainer.name}</TableCell>
                    <TableCell>{trainer.specialty}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant}>
                        {trainer.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {trainer.classesTaught}
                    </TableCell>
                    <TableCell className="text-right flex items-center justify-end gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      {trainer.memberRating.toFixed(1)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => handleViewProfile(trainer)}>View Profile</Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <TrainerProfileSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        selectedTrainer={selectedTrainer}
      />
    </div>
  );
};

export default TrainersPage;