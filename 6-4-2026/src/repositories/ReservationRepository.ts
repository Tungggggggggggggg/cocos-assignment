import { Database } from "./Database";
import { Reservation } from "../models/Reservation";

export class ReservationRepository {
    private db = Database.getInstance();

    save(reservation: Reservation): void {
        const index = this.db.data.reservations.findIndex(
            (r) => r.id === reservation.id,
        );
        if (index >= 0) this.db.data.reservations[index] = reservation;
        else this.db.data.reservations.push(reservation);
        this.db.save();
    }

    findById(id: string): Reservation | undefined {
        return this.db.data.reservations.find((r) => r.id === id);
    }

    findByBook(bookId: string): Reservation[] {
        return this.db.data.reservations.filter((r) => r.bookId === bookId);
    }

    findByMember(memberId: string): Reservation[] {
        return this.db.data.reservations.filter((r) => r.memberId === memberId);
    }

    findAll(): Reservation[] {
        return this.db.data.reservations;
    }
}
