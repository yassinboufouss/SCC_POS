import { Trainer, trainers } from "@/data/trainers";

// Utility to simulate updating trainer data
export const updateTrainer = (updatedTrainer: Trainer) => {
  const index = trainers.findIndex(trainer => trainer.id === updatedTrainer.id);
  if (index !== -1) {
    // Simulate updating the item in the mock array
    trainers[index] = updatedTrainer;
    console.log(`Mock Trainer Updated: ${updatedTrainer.name}`);
  }
};