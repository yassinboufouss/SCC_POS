export type Trainer = {
  id: string;
  name: string;
  specialty: string;
  status: 'Active' | 'On Leave';
  classesTaught: number;
  memberRating: number;
};

export const trainers: Trainer[] = [
  {
    id: "T001",
    name: "Sarah Connor",
    specialty: "Yoga & Flexibility",
    status: "Active",
    classesTaught: 15,
    memberRating: 4.8,
  },
  {
    id: "T002",
    name: "Kyle Reese",
    specialty: "HIIT & Spin",
    status: "Active",
    classesTaught: 22,
    memberRating: 4.5,
  },
  {
    id: "T003",
    name: "Marcus Wright",
    specialty: "Weightlifting & Strength",
    status: "On Leave",
    classesTaught: 8,
    memberRating: 4.9,
  },
];