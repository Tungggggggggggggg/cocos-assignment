import { Database } from "./Database";
import { Book } from "../models/Book";
import { BookCopy } from "../models/BookCopy";

export class BookRepository {
    private db = Database.getInstance();

    saveBook(book: Book): void {
        const index = this.db.data.books.findIndex((b) => b.id === book.id);
        if (index >= 0) this.db.data.books[index] = book;
        else this.db.data.books.push(book);
        this.db.save();
    }

    deleteBook(bookId: string): void {
        const book = this.db.data.books.find((b) => b.id === bookId);
        if (book) {
            book.isDeleted = true;
        }
        this.db.data.bookCopies
            .filter((c) => c.bookId === bookId)
            .forEach((c) => (c.isDeleted = true));
        this.db.save();
    }

    findById(id: string): Book | undefined {
        return this.db.data.books.find((b) => b.id === id && !b.isDeleted);
    }

    findAll(): Book[] {
        return this.db.data.books.filter((b) => !b.isDeleted);
    }

    search(query: string): Book[] {
        const q = query.toLowerCase();
        return this.db.data.books.filter(
            (b) =>
                !b.isDeleted &&
                (b.title.toLowerCase().includes(q) ||
                    b.author.toLowerCase().includes(q) ||
                    b.category.toLowerCase().includes(q)),
        );
    }

    saveCopy(copy: BookCopy): void {
        const index = this.db.data.bookCopies.findIndex(
            (c) => c.barcode === copy.barcode,
        );
        if (index >= 0) this.db.data.bookCopies[index] = copy;
        else this.db.data.bookCopies.push(copy);
        this.db.save();
    }

    findCopyByBarcode(barcode: string): BookCopy | undefined {
        return this.db.data.bookCopies.find(
            (c) => c.barcode === barcode && !c.isDeleted,
        );
    }

    findCopiesByBookId(bookId: string): BookCopy[] {
        return this.db.data.bookCopies.filter(
            (c) => c.bookId === bookId && !c.isDeleted,
        );
    }
}
