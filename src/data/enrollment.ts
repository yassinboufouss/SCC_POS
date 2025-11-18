import { format } from "date-fns";

export type Enrollment = {
  memberId: string;
  memberName: string;
  classId: string;
  enrollmentDate: string;
};

export const mockEnrollments: Enrollment[] = [
  {
    memberId: "M001",
    memberName: "Alice Johnson",
    classId: "yoga-mon",
    enrollmentDate: "2024-10-15",
  },
  {
    memberId: "M003",
    memberName: "Charlie Brown",
    classId: "yoga-mon",
    enrollmentDate: "2024-10-18",
  },
  {
    memberId: "M002",
    memberName: "Bob Smith",
    classId: "weights-wed",
    enrollmentDate: "2024-10-19",
  },
  // Simulate a full class enrollment
  ...Array.from({ length: 15 }, (_, i) => ({
    memberId: `M${100 + i}`,
    memberName: `Enrolled Member ${i + 1}`,
    classId: "spin-mon",
    enrollmentDate: format(new Date(), 'yyyy-MM-dd'),
  })),
];