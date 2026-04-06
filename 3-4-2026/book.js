class Book {
    constructor(id, title, author, year) {
        this.id = id;
        this.title = title;
        this.author = author;
        this.year = year;
        this.isAvailable = true;
    }

    getInfo() {
        const status = this.isAvailable ? "✅ Có sẵn" : "❌ Đang được mượn";
        return `[#${this.id}] "${this.title}" - ${this.author} (${this.year}) | ${status}`;
    }

    toString() {
        return this.getInfo();
    }
}

export default Book;
