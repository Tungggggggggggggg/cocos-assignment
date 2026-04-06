import { BookRepository } from "../repositories/BookRepository";
import { Book } from "../models/Book";
import { BookCopy } from "../models/BookCopy";
import { BookStatus } from "../types/enums";
import { idGenerator } from "../utils/idGenerator";
import { Result, success, failure } from "../utils/Result";

export class CatalogService {
    private repo = new BookRepository();

    addBook(
        isbn: string,
        title: string,
        author: string,
        category: string,
    ): Result<Book> {
        if (!isbn || !title)
            return failure("ISBN and title missing", "VALIDATION_ERROR");
        const book: Book = {
            id: idGenerator.generateId(),
            isbn,
            title,
            author,
            category,
        };
        this.repo.saveBook(book);
        return success(book);
    }

    addBookCopy(bookId: string): Result<BookCopy> {
        const book = this.repo.findById(bookId);
        if (!book) return failure("Book not found", "NOT_FOUND");

        const copy: BookCopy = {
            barcode: idGenerator.generateBarcode(),
            bookId,
            status: BookStatus.AVAILABLE,
        };
        this.repo.saveCopy(copy);
        return success(copy);
    }

    deleteBook(bookId: string): Result<void> {
        const book = this.repo.findById(bookId);
        if (!book) return failure("Book not found", "NOT_FOUND");

        const copies = this.repo.findCopiesByBookId(bookId);
        const hasBorrowedCopy = copies.some(
            (c) => c.status === BookStatus.BORROWED,
        );
        if (hasBorrowedCopy) {
            return failure(
                "Không thể xóa: Có ít nhất một bản sao đang được mượn. Vui lòng đợi tất cả được trả lại.",
                "BUSINESS_RULE_VIOLATION",
            );
        }
        this.repo.deleteBook(bookId);
        return success(undefined);
    }

    searchBooks(query: string): Book[] {
        return this.repo.search(query);
    }

    getAvailableCopiesCount(bookId: string): number {
        const copies = this.repo.findCopiesByBookId(bookId);
        return copies.filter((c) => c.status === BookStatus.AVAILABLE).length;
    }

    findAllBooks(): Book[] {
        return this.repo.findAll();
    }

    findBookCopies(bookId: string): BookCopy[] {
        return this.repo.findCopiesByBookId(bookId);
    }
}

