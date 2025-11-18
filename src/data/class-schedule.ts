export type GymClass = {
  id: string;
  name: string;
  trainer: string;
  time: string; // e.g., "10:00 AM"
  day: string; // e.g., "Monday"
  capacity: number;
  currentEnrollment: number;
};

export const classSchedule: GymClass[] = [
  {
    id: "yoga-mon",
    name: "Morning Yoga Flow",
    trainer: "Sarah Connor",
    time: "07:00 AM",
    day: "Monday",
    capacity: 20,
    currentEnrollment: 18,
  },
  {
    id: "spin-mon",
    name: "High Intensity Spin",
    trainer: "Kyle Reese",
    time: "06:00 PM",
    day: "Monday",
    capacity: 15,
    currentEnrollment: 15, // Full
  },
  {
    id: "zumba-tue",
    name: "Zumba Party",
    trainer: "Alice Johnson",
    time: "05:30 PM",
    day: "Tuesday",
    capacity: 30,
    currentEnrollment: 22,
  },
  {
    id: "weights-wed",
    name: "Strength Training 101",
    trainer: "Marcus Wright",
    time: "08:00 AM",
    day: "Wednesday",
    capacity: 10,
    currentEnrollment: 8,
  },
];

export const findClassById = (classId: string) => {
    return classSchedule.find(cls => cls.id === classId);
}