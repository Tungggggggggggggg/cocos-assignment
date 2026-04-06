import { createInterface } from "readline";

const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
});

const ask = (question) =>
    new Promise((resolve) => rl.question(question, resolve));
const printLine = () => console.log("─".repeat(50));
const printHeader = (text) => {
    printLine();
    console.log(`  📚 ${text}`);
    printLine();
};
const printSuccess = (msg) => console.log(`\n  ✅ ${msg}\n`);
const printError = (msg) => console.log(`\n  ❌ Lỗi: ${msg}\n`);

async function menuXemTatCaSach(lib) {
    printHeader("DANH SÁCH TẤT CẢ SÁCH");
    if (lib.books.length === 0) console.log("  (Thư viện chưa có sách nào)");
    else lib.books.forEach((b) => console.log("  " + b.getInfo()));
    console.log();
}

async function menuXemSachCoSan(lib) {
    printHeader("SÁCH CÒN CÓ THỂ MƯỢN");
    const list = lib.listAvailableBooks();
    if (list.length === 0) console.log("  (Không có sách nào khả dụng)");
    else list.forEach((b) => console.log("  " + b.getInfo()));
    console.log();
}

async function menuTimSach(lib) {
    printHeader("TÌM KIẾM SÁCH");
    const kw = await ask("  Nhập tên sách hoặc tác giả: ");
    const results = lib.searchBook(kw);
    if (results.length === 0) {
        console.log(`\n  Không tìm thấy kết quả nào với: "${kw}"\n`);
    } else {
        console.log(`\n  Tìm thấy ${results.length} kết quả:\n`);
        results.forEach((b) => console.log("  " + b.getInfo()));
        console.log();
    }
}

async function menuThemSach(lib) {
    printHeader("THÊM SÁCH MỚI");
    const title = await ask("  Tên sách: ");
    const author = await ask("  Tác giả: ");
    const year = parseInt(await ask("  Năm xuất bản: "));
    if (!title || !author || isNaN(year)) {
        printError("Thông tin không hợp lệ.");
        return;
    }
    printSuccess(`Đã thêm: ${lib.addBook(title, author, year).getInfo()}`);
}

async function menuXoaSach(lib) {
    printHeader("XÓA SÁCH");
    await menuXemTatCaSach(lib);
    const id = parseInt(await ask("  Nhập ID sách cần xóa: "));
    if (isNaN(id)) {
        printError("ID không hợp lệ.");
        return;
    }
    try {
        printSuccess(`Đã xóa sách: "${lib.removeBook(id).title}"`);
    } catch (e) {
        printError(e.message);
    }
}

async function menuXemThanhVien(lib) {
    printHeader("DANH SÁCH THÀNH VIÊN");
    if (lib.members.length === 0) console.log("  (Chưa có thành viên nào)");
    else lib.members.forEach((m) => console.log("  " + m.getInfo()));
    console.log();
}

async function menuThemThanhVien(lib) {
    printHeader("ĐĂNG KÝ THÀNH VIÊN MỚI");
    const name = await ask("  Họ tên: ");
    const email = await ask("  Email: ");
    if (!name || !email) {
        printError("Vui lòng nhập đầy đủ thông tin.");
        return;
    }
    try {
        printSuccess(`Đã đăng ký: ${lib.addMember(name, email).getInfo()}`);
    } catch (e) {
        printError(e.message);
    }
}

async function menuMuonSach(lib) {
    printHeader("MƯỢN SÁCH");
    await menuXemThanhVien(lib);
    const memberId = parseInt(await ask("  Nhập ID thành viên: "));
    await menuXemSachCoSan(lib);
    const bookId = parseInt(await ask("  Nhập ID sách muốn mượn: "));
    if (isNaN(memberId) || isNaN(bookId)) {
        printError("ID không hợp lệ.");
        return;
    }
    try {
        const { member, book } = lib.borrowBook(memberId, bookId);
        printSuccess(`"${member.name}" đã mượn thành công: "${book.title}"`);
    } catch (e) {
        printError(e.message);
    }
}

async function menuTraSach(lib) {
    printHeader("TRẢ SÁCH");
    await menuXemThanhVien(lib);
    const memberId = parseInt(await ask("  Nhập ID thành viên: "));
    if (isNaN(memberId)) {
        printError("ID không hợp lệ.");
        return;
    }
    try {
        const borrowed = lib.listBorrowedBooks(memberId);
        if (borrowed.length === 0) {
            console.log("\n  Thành viên này không đang mượn sách nào.\n");
            return;
        }
        console.log("\n  Sách đang mượn:");
        borrowed.forEach((b) => console.log("  " + b.getInfo()));
        const bookId = parseInt(await ask("\n  Nhập ID sách muốn trả: "));
        if (isNaN(bookId)) {
            printError("ID không hợp lệ.");
            return;
        }
        const { member, book } = lib.returnBook(memberId, bookId);
        printSuccess(`"${member.name}" đã trả sách: "${book.title}"`);
    } catch (e) {
        printError(e.message);
    }
}

async function menuXemSachDangMuon(lib) {
    printHeader("XEM SÁCH ĐANG MƯỢN CỦA THÀNH VIÊN");
    await menuXemThanhVien(lib);
    const memberId = parseInt(await ask("  Nhập ID thành viên: "));
    if (isNaN(memberId)) {
        printError("ID không hợp lệ.");
        return;
    }
    try {
        const member = lib.members.find((m) => m.id === memberId);
        const borrowed = lib.listBorrowedBooks(memberId);
        console.log(
            `\n  Sách "${member.name}" đang mượn (${borrowed.length} cuốn):`,
        );
        if (borrowed.length === 0) console.log("  (Không có)");
        else borrowed.forEach((b) => console.log("  " + b.getInfo()));
        console.log();
    } catch (e) {
        printError(e.message);
    }
}

export default {
    rl,
    ask,
    printLine,
    printHeader,
    printSuccess,
    printError,
    menuXemTatCaSach,
    menuXemSachCoSan,
    menuTimSach,
    menuThemSach,
    menuXoaSach,
    menuXemThanhVien,
    menuThemThanhVien,
    menuMuonSach,
    menuTraSach,
    menuXemSachDangMuon,
};
