import { addDays, format, isFuture } from 'date-fns';

/**
 * Calculates the new start and expiration dates for a membership renewal.
 * If the current membership is still active (expiration date is in the future),
 * the new plan starts the day after the current expiration. Otherwise, it starts today.
 * @param currentExpirationDate The current expiration date string (YYYY-MM-DD) or null.
 * @param durationDays The duration of the new plan in days.
 * @returns { start_date: string, newExpiration: string }
 */
export const calculateRenewalDates = (currentExpirationDate: string | null | undefined, durationDays: number) => {
    const now = new Date();
    let newStartDate = now;
    
    if (currentExpirationDate) {
        const currentExpiration = new Date(currentExpirationDate);
        // Check if the current expiration is in the future (still active)
        if (isFuture(currentExpiration)) {
            // Start the new plan the day after the current one ends
            newStartDate = addDays(currentExpiration, 1);
        }
    }
    
    const newExpirationDate = addDays(newStartDate, durationDays);
    
    return {
        start_date: format(newStartDate, 'yyyy-MM-dd'),
        newExpiration: format(newExpirationDate, 'yyyy-MM-dd'),
    };
};