let currentTime = () => new Date();

export const dateUtils = {
    now(): Date {
        return currentTime();
    },

    setMockTime(date: Date) {
        currentTime = () => new Date(date.getTime());
    },

    resetMockTime() {
        currentTime = () => new Date();
    },

    diffDays(dateA: Date, dateB: Date): number {
        const diffTime = Math.abs(dateA.getTime() - dateB.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    },

    diffDaysSigned(dateA: Date, dateB: Date): number {
        const diffTime = dateA.getTime() - dateB.getTime();
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    },

    addDays(date: Date, n: number): Date {
        const result = new Date(date.getTime());
        result.setDate(result.getDate() + n);
        return result;
    },
};
