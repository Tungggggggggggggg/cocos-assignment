import { LoanStatus } from "../types/enums";

export interface LoanRecord {
    id: string;
    bookCopyBarcode: string;
    memberId: string;
    borrowDate: Date;
    dueDate: Date;
    returnDate: Date | null;
    status: LoanStatus;
    renewCount: number;
    renewalHistory: Date[];
    fineAmount: number;
}
