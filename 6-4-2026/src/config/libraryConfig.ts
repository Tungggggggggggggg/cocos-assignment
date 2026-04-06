export const LIBRARY_CONFIG = {
    finePerDay: 5_000,
    fineMaxCap: 200_000,
    lostBookFine: 150_000,
    maxRenewals: 2,
    reservationExpiryDays: 3,

    tiers: {
        STANDARD: { maxBooks: 3, loanDays: 14 },
        PREMIUM: { maxBooks: 10, loanDays: 30 },
        STAFF: { maxBooks: 99, loanDays: 60 },
    },
};
