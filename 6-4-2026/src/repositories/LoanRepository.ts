import { Database } from "./Database";
import { LoanRecord } from "../models/LoanRecord";
import { LoanStatus } from "../types/enums";

export class LoanRepository {
    private db = Database.getInstance();

    save(loan: LoanRecord): void {
        const index = this.db.data.loans.findIndex((l) => l.id === loan.id);
        if (index >= 0) this.db.data.loans[index] = loan;
        else this.db.data.loans.push(loan);
        this.db.save();
    }

    findById(id: string): LoanRecord | undefined {
        return this.db.data.loans.find((l) => l.id === id);
    }

    findByMember(memberId: string): LoanRecord[] {
        return this.db.data.loans.filter((l) => l.memberId === memberId);
    }

    findActiveByMember(memberId: string): LoanRecord[] {
        return this.db.data.loans.filter(
            (l) =>
                l.memberId === memberId &&
                (l.status === LoanStatus.ACTIVE ||
                    l.status === LoanStatus.OVERDUE),
        );
    }

    findActiveByBarcode(barcode: string): LoanRecord | undefined {
        return this.db.data.loans.find(
            (l) =>
                l.bookCopyBarcode === barcode &&
                (l.status === LoanStatus.ACTIVE ||
                    l.status === LoanStatus.OVERDUE),
        );
    }

    findAllActiveAndOverdue(): LoanRecord[] {
        return this.db.data.loans.filter(
            (l) =>
                l.status === LoanStatus.ACTIVE ||
                l.status === LoanStatus.OVERDUE,
        );
    }
}
