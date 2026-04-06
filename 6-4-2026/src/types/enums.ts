export enum BookStatus {
    AVAILABLE = "AVAILABLE",
    BORROWED = "BORROWED",
    ON_HOLD = "ON_HOLD",
    LOST = "LOST",
    MAINTENANCE = "MAINTENANCE",
}

export enum MemberStatus {
    ACTIVE = "ACTIVE",
    SUSPENDED = "SUSPENDED",
}

export enum MemberTier {
    STANDARD = "STANDARD",
    PREMIUM = "PREMIUM",
    STAFF = "STAFF",
}

export enum LoanStatus {
    ACTIVE = "ACTIVE",
    RETURNED = "RETURNED",
    OVERDUE = "OVERDUE",
}

export enum ReservationStatus {
    PENDING = "PENDING",
    NOTIFIED = "NOTIFIED",
    FULFILLED = "FULFILLED",
    EXPIRED = "EXPIRED",
    CANCELLED = "CANCELLED",
}
