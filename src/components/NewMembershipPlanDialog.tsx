import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle } from 'lucide-react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from '@/components/ui/textarea';
import { showSuccess } from '@/utils/toast';

const newPlanSchema = z.object({
  name: z.string().min(2, { message: "Plan name is required." }),
  price: z.coerce.number().min(0.01, { message: "Price must be greater than zero." }),
  durationDays: z.coerce.number().int().min(1, { message: "Duration must be at least 1 day." }),
  description: z.string().min(10, { message: "Description is required." }),
});

type NewPlanFormValues = z.infer<typeof newPlanSchema>;

const NewMembershipPlanDialog = () => {
  const [open, setOpen] = useState(false);
  
  const form = useForm<NewPlanFormValues>({
    resolver: zodResolver(newPlanSchema),
    defaultValues: {
      name: "",
      price: 0.00,
      durationDays: 30,
      description: "",
    },
  });

  const onSubmit = (values: NewPlanFormValues) => {
    const newPlan = {
      ...values,
      id: `PLAN${Math.floor(Math.random() * 10000)}`, // Mock ID generation
    };
    
    console.log("Adding new membership plan:", newPlan);
    showSuccess(`New plan '${values.name}' created successfully.`);
    
    form.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Create New Plan
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Create New Membership Plan</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plan Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Premium Annual" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price ($)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        placeholder="99.99" 
                        {...field} 
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="durationDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (Days)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="30" 
                        {...field} 
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Detailed description of plan benefits..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full mt-6" disabled={!form.formState.isValid}>
              Create Plan
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default NewMembershipPlanDialog;