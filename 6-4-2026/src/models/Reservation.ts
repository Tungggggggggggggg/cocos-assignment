import { ReservationStatus } from "../types/enums";

export interface Reservation {
    id: string;
    memberId: string;
    bookId: string;
    status: ReservationStatus;
    createdAt: Date;
    expiryDate: Date;
    notifiedAt: Date | null;
}
