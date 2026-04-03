import Book from "./book";
import Member from "./member";

class Library {
    constructor() {
        this.books = [];
        this.members = [];
        this.nextBookId = 1;
        this.nextMemberId = 1;
    }

    addBook(title, author, year) {
        const book = new Book(this.nextBookId++, title, author, year);
        this.books.push(book);
        return book;
    }

    removeBook(bookId) {
        const book = this.books.find((b) => b.id === bookId);
        if (!book) throw new Error(`Không tìm thấy sách có ID: ${bookId}`);
        if (!book.isAvailable)
            throw new Error(
                `Không thể xóa sách đang được mượn: "${book.title}"`,
            );
        this.books = this.books.filter((b) => b.id !== bookId);
        return book;
    }

    searchBook(keyword) {
        const kw = keyword.toLowerCase();
        return this.books.filter(
            (b) =>
                b.title.toLowerCase().includes(kw) ||
                b.author.toLowerCase().includes(kw),
        );
    }

    addMember(name, email) {
        const exists = this.members.find((m) => m.email === email);
        if (exists) throw new Error(`Email "${email}" đã được đăng ký!`);
        const member = new Member(this.nextMemberId++, name, email);
        this.members.push(member);
        return member;
    }

    borrowBook(memberId, bookId) {
        const member = this.members.find((m) => m.id === memberId);
        if (!member)
            throw new Error(`Không tìm thấy thành viên có ID: ${memberId}`);
        const book = this.books.find((b) => b.id === bookId);
        if (!book) throw new Error(`Không tìm thấy sách có ID: ${bookId}`);
        if (!book.isAvailable)
            throw new Error(
                `Sách "${book.title}" đang được mượn bởi người khác!`,
            );
        book.isAvailable = false;
        member.borrowedBooks.push(book);
        return { member, book };
    }

    returnBook(memberId, bookId) {
        const member = this.members.find((m) => m.id === memberId);
        if (!member)
            throw new Error(`Không tìm thấy thành viên có ID: ${memberId}`);
        const bookIndex = member.borrowedBooks.findIndex(
            (b) => b.id === bookId,
        );
        if (bookIndex === -1)
            throw new Error(
                `Thành viên "${member.name}" không có mượn sách ID: ${bookId}`,
            );
        const book = member.borrowedBooks[bookIndex];
        book.isAvailable = true;
        member.borrowedBooks.splice(bookIndex, 1);
        return { member, book };
    }

    listAvailableBooks() {
        return this.books.filter((b) => b.isAvailable);
    }

    listBorrowedBooks(memberId) {
        const member = this.members.find((m) => m.id === memberId);
        if (!member)
            throw new Error(`Không tìm thấy thành viên có ID: ${memberId}`);
        return member.borrowedBooks;
    }
}

export default Library;
