import { BookStatus } from "../types/enums";

export interface BookCopy {
    barcode: string;
    bookId: string;
    status: BookStatus;
    isDeleted?: boolean;
}
