export type Trainer = {
  id: string;
  name: string;
  specialty: string;
  status: 'Active' | 'On Leave';
  classesTaught: number;
  memberRating: number;
  email: string;
  phone: string;
};

export const trainers: Trainer[] = [
  {
    id: "T001",
    name: "Sarah Connor",
    specialty: "Yoga & Flexibility",
    status: "Active",
    classesTaught: 15,
    memberRating: 4.8,
    email: "sarah.connor@gym.com",
    phone: "555-111-2222",
  },
  {
    id: "T002",
    name: "Kyle Reese",
    specialty: "HIIT & Spin",
    status: "Active",
    classesTaught: 22,
    memberRating: 4.5,
    email: "kyle.reese@gym.com",
    phone: "555-333-4444",
  },
  {
    id: "T003",
    name: "Marcus Wright",
    specialty: "Weightlifting & Strength",
    status: "On Leave",
    classesTaught: 8,
    memberRating: 4.9,
    email: "marcus.wright@gym.com",
    phone: "555-555-6666",
  },
];