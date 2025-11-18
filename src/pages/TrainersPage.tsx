import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell } from 'lucide-react';
import { trainers, Trainer } from '@/data/trainers';
import TrainerProfileSheet from '@/components/TrainerProfileSheet';
import NewTrainerDialog from '@/components/NewTrainerDialog';
import { DataTable } from '@/components/DataTable';
import { createTrainerColumns } from './trainers/trainer-columns';
import { useTranslation } from 'react-i18next';

const TrainersPage = () => {
  const { t } = useTranslation();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);

  const handleViewProfile = (trainer: Trainer) => {
    setSelectedTrainer(trainer);
    setIsSheetOpen(true);
  };
  
  const columns = createTrainerColumns(handleViewProfile);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{t("trainer_management")}</h1>
        <NewTrainerDialog />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5" /> {t("current_staff", { count: trainers.length })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={trainers}
            filterColumnId="name"
            filterPlaceholder={t("search_by_name")}
          />
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