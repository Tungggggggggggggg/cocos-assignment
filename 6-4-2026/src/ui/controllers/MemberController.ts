import { BorrowingService } from "../../services/BorrowingService";
import { ReservationService } from "../../services/ReservationService";
import { FineService } from "../../services/FineService";
import { CatalogService } from "../../services/CatalogService";
import {
    ask,
    printHeader,
    printSuccess,
    printError,
    printLine,
} from "../uiUtils";
import { FineRepository } from "../../repositories/FineRepository";
import { Member } from "../../models/Member";

export class MemberController {
    private fineRepo = new FineRepository();
    private currentUser!: Member;

    constructor(
        private borrowingService: BorrowingService,
        private reservationService: ReservationService,
        private catalogService: CatalogService,
        private fineService: FineService,
    ) {}

    async showMenu(member: Member) {
        this.currentUser = member;
        
        while (true) {
            printHeader(`MENU THÀNH VIÊN: ${this.currentUser.name}`);
            console.log("  1. Tìm kiếm sách");
            console.log("  2. Mượn sách (nhập Barcode)");
            console.log("  3. Trả sách (nhập Barcode)");
            console.log("  4. Gia hạn sách");
            console.log("  5. Đặt trước sách đang hết");
            console.log("  6. Xem sách đang mượn");
            console.log("  7. Xem & thanh toán tiền phạt");
            console.log("  8. Hủy đặt trước");
            console.log("  9. Báo mất sách");
            console.log("  0. Đăng xuất");
            printLine();

            const choice = await ask("  Chọn chức năng (0-9): ");
            switch (choice.trim()) {
                case "1":
                    await this.searchBook();
                    break;
                case "2":
                    await this.borrowBook();
                    break;
                case "3":
                    await this.returnBook();
                    break;
                case "4":
                    await this.renewBook();
                    break;
                case "5":
                    await this.reserveBook();
                    break;
                case "6":
                    this.viewBorrowedBooks();
                    break;
                case "7":
                    await this.handleFines();
                    break;
                case "8":
                    await this.cancelReservation(); 
                    break;
                case "9":
                    await this.reportLostBook();
                    break;
                case "0":
                    return;
                default:
                    printError("Lựa chọn không hợp lệ.");
            }
        }
    }

    private async searchBook() {
        const q = await ask("  Nhập từ khoá (tên sách / tác giả / thể loại): ");
        const books = this.catalogService.searchBooks(q.trim());
        if (books.length === 0) {
            console.log(`\n  Không tìm thấy kết quả nào cho: "${q}"\n`);
        } else {
            console.log(`\n  Tìm thấy ${books.length} đầu sách:\n`);
            books.forEach((b) => {
                const avail = this.catalogService.getAvailableCopiesCount(b.id);
                const copies = this.catalogService.findBookCopies(b.id);
                console.log(`  [${b.id}]`);
                console.log(`    📖 "${b.title}" — ${b.author}`);
                console.log(`    Thể loại: ${b.category} | ISBN: ${b.isbn}`);
                console.log(`    Số bản sẵn sàng: ${avail}/${copies.length}`);
                if (avail > 0) {
                    const availCopies = copies.filter(
                        (c) => c.status === "AVAILABLE",
                    );
                    availCopies.forEach((c) =>
                        console.log(`      ✅ Barcode: ${c.barcode}`),
                    );
                } else {
                    console.log(`      ❌ Tất cả bản sao đang được mượn`);
                }
                console.log();
            });
        }
    }

    private async borrowBook() {
        const barcode = await ask("  Nhập mã vạch (Barcode) của ấn phẩm: ");
        const res = this.borrowingService.checkOut(this.currentUser.id, barcode.trim());
        if (res.success) {
            printSuccess("Mượn sách thành công!");
            console.log(`  Loan ID : ${res.data.id}`);
            console.log(`  Barcode : ${res.data.bookCopyBarcode}`);
            console.log(
                `  Ngày mượn: ${new Date(res.data.borrowDate).toLocaleDateString()}`,
            );
            console.log(
                `  Hạn trả : ${new Date(res.data.dueDate).toLocaleDateString()}\n`,
            );
        } else {
            printError(res.error);
        }
    }

    private async returnBook() {
        const barcode = await ask("  Nhập mã vạch (Barcode) sách muốn trả: ");
        const res = this.borrowingService.checkIn(barcode.trim());
        if (res.success) {
            if (res.data.fineAmount > 0) {
                console.log(
                    `\n  ⚠️  Trả sách thành công — nhưng BẠN BỊ PHẠT do trễ hạn!`,
                );
                console.log(
                    `  Tiền phạt: ${res.data.fineAmount.toLocaleString()} VND`,
                );
                console.log(
                    `  Vui lòng thanh toán tại mục [7] để mở khoá tài khoản.\n`,
                );
            } else {
                printSuccess(
                    "Trả sách thành công! Cảm ơn bạn đã trả đúng hạn 🎉",
                );
            }
        } else {
            printError(res.error);
        }
    }

    private async renewBook() {
        this.viewBorrowedBooks();
        const loanId = await ask("  Nhập Loan ID muốn gia hạn: ");
        const res = this.borrowingService.renewLoan(loanId.trim());
        if (res.success) {
            printSuccess("Gia hạn thành công!");
            console.log(
                `  Hạn trả mới: ${new Date(res.data.dueDate).toLocaleDateString()}`,
            );
            console.log(`  Số lần đã gia hạn: ${res.data.renewCount}\n`);
        } else {
            printError(res.error);
        }
    }

    private async reserveBook() {
        const bookId = await ask("  Nhập ID Đầu sách muốn đặt trước: ");
        const res = this.reservationService.reserve(this.currentUser.id, bookId.trim());
        if (res.success) {
            printSuccess("Đặt trước thành công!");
            console.log(`  Reservation ID: ${res.data.id}`);
            console.log(
                `  Hết hạn giữ chỗ sau: ${new Date(res.data.expiryDate).toLocaleDateString()}\n`,
            );
        } else {
            printError(res.error);
        }
    }

    private viewBorrowedBooks() {
        const loans = this.borrowingService.getActiveLoansByMember(this.currentUser.id);
        if (loans.length === 0) {
            console.log("\n  Bạn không đang mượn quyển sách nào.\n");
        } else {
            console.log(`\n  Bạn đang mượn ${loans.length} quyển:\n`);
            loans.forEach((l) => {
                const due = new Date(l.dueDate);
                const today = new Date();
                const daysLeft = Math.floor(
                    (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
                );
                const status =
                    daysLeft < 0
                        ? `⚠️  Quá hạn ${Math.abs(daysLeft)} ngày!`
                        : `📅 Còn ${daysLeft} ngày`;
                console.log(`  Loan ID : ${l.id}`);
                console.log(`  Barcode : ${l.bookCopyBarcode}`);
                console.log(
                    `  Hạn trả : ${due.toLocaleDateString()} (${status})`,
                );
                console.log(`  Gia hạn : ${l.renewCount} lần\n`);
            });
        }
    }

    private async handleFines() {
        const fines = this.fineRepo.findByMember(this.currentUser.id);
        const unpaid = fines.filter((f) => !f.paidAt && !f.waivedBy);
        const paid = fines.filter((f) => f.paidAt || f.waivedBy);

        if (unpaid.length === 0 && paid.length === 0) {
            console.log("\n  Bạn không có khoản phạt nào.\n");
            return;
        }

        if (unpaid.length > 0) {
            console.log(
                `\n  ⚠️  Phạt chưa thanh toán (${unpaid.length} khoản):\n`,
            );
            unpaid.forEach((f) => {
                console.log(`  Fine ID : ${f.id}`);
                console.log(`  Số tiền : ${f.amount.toLocaleString()} VND`);
                console.log(
                    `  Lý do   : ${f.reason === "overdue" ? "Trả sách trễ hạn" : "Làm mất sách"}`,
                );
                console.log(
                    `  Ngày phát sinh: ${new Date(f.createdAt).toLocaleDateString()}\n`,
                );
            });

            const pay = await ask("  Bạn có muốn thanh toán không? (y/n): ");
            if (pay.toLowerCase().trim() === "y") {
                const fineId = await ask("  Nhập Fine ID muốn thanh toán: ");
                const res = this.fineService.payFine(this.currentUser.id, fineId.trim());
                if (res.success)
                    printSuccess(
                        `Thanh toán thành công ${res.data.amount.toLocaleString()} VND! Cảm ơn bạn.`,
                    );
                else printError(res.error);
            }
        }

        if (paid.length > 0) {
            console.log(`\n  ✅ Lịch sử đã đóng phạt (${paid.length} khoản):`);
            paid.forEach((f) => {
                const settled = f.paidAt
                    ? `Đã nộp ${new Date(f.paidAt).toLocaleDateString()}`
                    : `Được miễn bởi ${f.waivedBy}`;
                console.log(
                    `  - ${f.amount.toLocaleString()} VND | ${settled}`,
                );
            });
            console.log();
        }
    }

    private async cancelReservation() {
        const pendingRes = this.reservationService.getPendingByMember(this.currentUser.id);

        if (pendingRes.length === 0) {
            console.log("\n  Bạn không có đặt trước nào đang PENDING.\n");
            return;
        }

        console.log(`\n  📋 Đặt trước PENDING của bạn (${pendingRes.length} mục):\n`);
        pendingRes.forEach((r) => {
            console.log(`  ID: ${r.id}`);
            console.log(`  Book ID : ${r.bookId}`);
            console.log(`  Ngày đặt: ${new Date(r.createdAt).toLocaleDateString()}`);
            console.log(`  Hết hạn : ${new Date(r.expiryDate).toLocaleDateString()}\n`);
        });

        const reservationId = await ask("  Nhập Reservation ID muốn hủy: ");
        const res = this.reservationService.cancelReservation(
            this.currentUser.id,
            reservationId.trim(),
        );
        if (res.success) {
            printSuccess(
                `Đã hủy đặt trước (ID: ${res.data.id}) thành công.`,
            );
        } else {
            printError(res.error);
        }
    }

    private async reportLostBook() {
        this.viewBorrowedBooks();
        if (this.borrowingService.getActiveLoansByMember(this.currentUser.id).length === 0)
            return;

        const barcode = await ask("  Nhập Barcode sách bị mất: ");
        const confirm = await ask(
            `  ⚠️  Xác nhận báo mất sách [${barcode.trim()}]? Phí phạt cố định 150.000 VND sẽ được áp dụng. (y/n): `,
        );
        if (confirm.toLowerCase().trim() !== "y") {
            console.log("  Đã hủy thao tác.\n");
            return;
        }

        const res = this.borrowingService.reportLostBook(this.currentUser.id, barcode.trim());
        if (res.success) {
            console.log(`\n  🚨 Báo mất sách thành công.`);
            console.log(`  Phí phạt 150.000 VND đã được ghi nhận.`);
            console.log(`  Tài khoản của bạn đã bị tạm khóa cho đến khi thanh toán.`);
            console.log(`  Vui lòng thanh toán tiền phạt tại mục [7].\n`);
        } else {
            printError(res.error);
        }
    }
}
