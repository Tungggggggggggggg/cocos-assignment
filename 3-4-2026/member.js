class Member {
    constructor(id, name, email) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.borrowedBooks = [];
    }

    getInfo() {
        return `[M${this.id}] ${this.name} | ${this.email} | Đang mượn: ${this.borrowedBooks.length} cuốn`;
    }

    toString() {
        return this.getInfo();
    }
}

export default Member;
