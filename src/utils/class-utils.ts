import { mockEnrollments, Enrollment } from "@/data/enrollment";
import { classSchedule, findClassById, GymClass } from "@/data/class-schedule";
import { format } from "date-fns";

// Helper to update the currentEnrollment count in the classSchedule array
const updateClassEnrollmentCount = (classId: string, delta: number) => {
    const classIndex = classSchedule.findIndex(cls => cls.id === classId);
    if (classIndex !== -1) {
        classSchedule[classIndex].currentEnrollment += delta;
        // Ensure count doesn't go below zero
        if (classSchedule[classIndex].currentEnrollment < 0) {
            classSchedule[classIndex].currentEnrollment = 0;
        }
        return classSchedule[classIndex];
    }
    return null;
};

export const getEnrollmentsByClass = (classId: string): Enrollment[] => {
    return mockEnrollments.filter(e => e.classId === classId);
};

export const addEnrollment = (memberId: string, memberName: string, classId: string): Enrollment | null => {
    const targetClass = findClassById(classId);
    if (!targetClass) {
        console.error("Class not found for enrollment.");
        return null;
    }
    
    if (targetClass.currentEnrollment >= targetClass.capacity) {
        console.error("Class is full.");
        return null;
    }
    
    // Check if member is already enrolled
    if (mockEnrollments.some(e => e.memberId === memberId && e.classId === classId)) {
        console.error("Member already enrolled in this class.");
        return null;
    }

    const newEnrollment: Enrollment = {
        memberId,
        memberName,
        classId,
        enrollmentDate: format(new Date(), 'yyyy-MM-dd'),
    };

    mockEnrollments.push(newEnrollment);
    updateClassEnrollmentCount(classId, 1);
    
    return newEnrollment;
};

export const removeEnrollment = (memberId: string, classId: string): boolean => {
    const initialLength = mockEnrollments.length;
    
    // Remove enrollment from the mock array
    const indexToRemove = mockEnrollments.findIndex(e => e.memberId === memberId && e.classId === classId);
    
    if (indexToRemove !== -1) {
        mockEnrollments.splice(indexToRemove, 1);
        updateClassEnrollmentCount(classId, -1);
        return true;
    }
    
    return false;
};

export const getClassDetails = (classId: string): GymClass | undefined => {
    return findClassById(classId);
}