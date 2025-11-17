import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Clock, Users, Calendar } from 'lucide-react';
import { classSchedule, GymClass } from '@/data/class-schedule.ts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';

const ClassesPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Class Schedule Management</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Class
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" /> Upcoming Classes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class Name</TableHead>
                <TableHead>Day & Time</TableHead>
                <TableHead>Trainer</TableHead>
                <TableHead className="text-center">Enrollment</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classSchedule.map((cls: GymClass) => {
                const isFull = cls.currentEnrollment >= cls.capacity;
                return (
                  <TableRow key={cls.id}>
                    <TableCell className="font-medium">{cls.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {cls.day} at {cls.time}
                      </div>
                    </TableCell>
                    <TableCell>{cls.trainer}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={isFull ? "destructive" : "secondary"}>
                        {cls.currentEnrollment} / {cls.capacity}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm">View Details</Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClassesPage;