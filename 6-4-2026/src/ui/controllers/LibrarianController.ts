import { CatalogService } from "../../services/CatalogService";
import { MemberService } from "../../services/MemberService";
import { AuditService } from "../../services/AuditService";
import { FineService } from "../../services/FineService";
import { BorrowingService } from "../../services/BorrowingService";
import { MemberRepository } from "../../repositories/MemberRepository";
import {
    ask,
    printHeader,
    printSuccess,
    printError,
    printLine,
    parseTier,
    askPassword,
} from "../uiUtils";
import { LoanStatus } from "../../types/enums";
import { dateUtils } from "../../utils/dateUtils";

export class LibrarianController {
    private memberRepo = new MemberRepository();

    constructor(
        private catalogService: CatalogService,
        private memberService: MemberService,
        private auditService: AuditService,
        private fineService: FineService,
        private borrowingService: BorrowingService, 
    ) {}

    async showMenu() {
        while (true) {
            printHeader("MENU THỦ THƯ");
            console.log("  1. Quản lý Đầu sách (Thêm sách/Copy/Xóa)");
            console.log("  2. Quản lý Thành viên (Thêm/Khoá/Kích hoạt/Đổi tier)");
            console.log("  3. Miễn phạt cho thành viên");
            console.log("  4. Xem Audit Log");
            console.log("  5. Xem sách đang mượn / quá hạn"); 
            console.log("  0. Quay lại Menu Chính");
            printLine();

            const choice = await ask("  Chọn chức năng (0-5): ");
            switch (choice.trim()) {
                case "1":
                    await this.manageCatalog();
                    break;
                case "2":
                    await this.manageMembers();
                    break;
                case "3":
                    await this.waiveFine();
                    break;
                case "4":
                    this.viewAuditLog();
                    break;
                case "5":
                    this.viewActiveLoans();  
                    break;
                case "0":
                    return;
                default:
                    printError("Lựa chọn không hợp lệ.");
            }
        }
    }

    private async manageCatalog() {
        const action = await ask(
            "  Chọn hành động: [1] Thêm Đầu sách, [2] Thêm Bản sao (Copy), [3] Xem tất cả, [4] Xóa Đầu sách: ",
        );
        if (action === "1") {
            const isbn = await ask("  ISBN: ");
            const title = await ask("  Tiêu đề: ");
            const author = await ask("  Tác giả: ");
            const category = await ask("  Thể loại: ");
            const res = this.catalogService.addBook(
                isbn,
                title,
                author,
                category,
            );
            if (res.success)
                printSuccess(
                    `Đã thêm sách: ${res.data.title} (ID: ${res.data.id})`,
                );
            else printError(res.error);
        } else if (action === "2") {
            const bookId = await ask("  Nhập ID đầu sách: ");
            const res = this.catalogService.addBookCopy(bookId.trim());
            if (res.success)
                printSuccess(
                    `Đã thêm bản sao mới, Barcode: ${res.data.barcode}`,
                );
            else printError(res.error);
        } else if (action === "3") {
            const books = this.catalogService.findAllBooks();
            if (books.length === 0) {
                console.log("  (Chưa có đầu sách nào)\n");
            } else {
                books.forEach((b) => {
                    const copies = this.catalogService.findBookCopies(b.id);
                    const available = copies.filter(
                        (c) => c.status === "AVAILABLE",
                    ).length;
                    console.log(`  [${b.id}]`);
                    console.log(
                        `    📖 ${b.title} — ${b.author} (${b.category})`,
                    );
                    console.log(
                        `    ISBN: ${b.isbn} | Bản sao: ${copies.length} | Sẵn sàng: ${available}`,
                    );
                    copies.forEach((c) =>
                        console.log(
                            `      - Barcode: ${c.barcode}  (${c.status})`,
                        ),
                    );
                    console.log();
                });
            }
        } else if (action === "4") {
            const bookId = await ask("  Nhập ID đầu sách cần xóa: ");
            const confirm = await ask(
                `  ⚠️  Xác nhận xóa đầu sách [${bookId.trim()}]? (y/n): `,
            );
            if (confirm.toLowerCase().trim() !== "y") {
                console.log("  Đã hủy thao tác xóa.\n");
                return;
            }
            const res = this.catalogService.deleteBook(bookId.trim());
            if (res.success) {
                printSuccess("Đã xóa đầu sách và tất cả bản sao thành công.");
                this.auditService.logAction(
                    "LIBRARIAN",
                    "DELETE_BOOK",
                    bookId.trim(),
                );
            } else {
                printError(res.error);
            }
        } else {
            printError("Hành động không hợp lệ.");
        }
    }

    private async manageMembers() {
        const action = await ask(
            "  Chọn hành động: [1] Thêm TV, [2] Khoá TV, [3] Kích hoạt TV, [4] Xem tất cả, [5] Đổi Tier: ",
        );
        if (action === "1") {
            const name = await ask("  Tên: ");
            const email = await ask("  Email: ");
            const passwordStr = askPassword("  Mật khẩu tạm thời: ");
            const tierStr = await ask("  Hạng (STANDARD / PREMIUM / STAFF): ");
            const tier = parseTier(tierStr);
            if (tier === null) {
                printError(
                    "Hạng thành viên không hợp lệ. Vui lòng nhập: STANDARD, PREMIUM hoặc STAFF",
                );
                return;
            }
            const res = this.memberService.registerMember(
                name.trim(),
                email.trim(),
                passwordStr,
                tier,
            );
            if (res.success) {
                printSuccess(`Tạo thành viên thành công!`);
                console.log(`  ID     : ${res.data.id}`);
                console.log(`  Tên    : ${res.data.name}`);
                console.log(`  Email  : ${res.data.email}`);
                console.log(`  Hạng   : ${res.data.tier}`);
                console.log(
                    `  Hạn thẻ: ${res.data.expiryDate.toLocaleDateString()}\n`,
                );
            } else {
                printError(res.error);
            }
        } else if (action === "2") {
            const id = await ask("  ID Thành viên: ");
            const res = this.memberService.suspendMember(id.trim());
            if (res.success)
                printSuccess(`Đã khoá tài khoản: ${res.data.name}`);
            else printError(res.error);
        } else if (action === "3") {
            const id = await ask("  ID Thành viên: ");
            const res = this.memberService.activateMember(id.trim());
            if (res.success)
                printSuccess(`Đã kích hoạt tài khoản: ${res.data.name}`);
            else printError(res.error);
        } else if (action === "4") {
            const members = this.memberService.findAll();
            if (members.length === 0) {
                console.log("  (Chưa có thành viên nào)\n");
            } else {
                members.forEach((m) => {
                    const unpaid = m.unpaidFineIds.length;
                    console.log(`  [${m.id}]`);
                    console.log(`    👤 ${m.name} — ${m.email}`);
                    console.log(
                        `    Hạng: ${m.tier} | Trạng thái: ${m.status} | Phạt chưa đóng: ${unpaid} khoản`,
                    );
                    console.log();
                });
            }
        } else if (action === "5") {
            const id = await ask("  ID Thành viên: ");
            const member = this.memberRepo.findById(id.trim());
            if (!member) {
                printError(`Không tìm thấy thành viên với ID: ${id.trim()}`);
                return;
            }
            console.log(`  Tier hiện tại: ${member.tier}`);
            const tierStr = await ask(
                "  Hạng mới (STANDARD / PREMIUM / STAFF): ",
            );
            const newTier = parseTier(tierStr);
            if (newTier === null) {
                printError(
                    "Hạng thành viên không hợp lệ. Vui lòng nhập: STANDARD, PREMIUM hoặc STAFF",
                );
                return;
            }
            const res = this.memberService.changeTier(id.trim(), newTier);
            if (res.success) {
                this.auditService.logAction(
                    "LIBRARIAN",
                    "CHANGE_TIER",
                    id.trim(),
                    `${member.tier} → ${newTier}`,
                );
                printSuccess(
                    `Đã đổi tier ${res.data.name}: ${member.tier} → ${newTier}`,
                );
            } else {
                printError(res.error);
            }
        } else {
            printError("Hành động không hợp lệ.");
        }
    }

    private async waiveFine() {
        const memberId = await ask("  Nhập ID Thành viên: ");
        const fineId = await ask("  Nhập ID Phiếu phạt: ");
        const librarianId = await ask("  Nhập ID Thủ thư phê duyệt: ");
        const note = await ask("  Ghi chú lý do miễn phạt: ");

        const res = this.fineService.waiveFine(
            memberId.trim(),
            fineId.trim(),
            librarianId.trim(),
            note.trim(),
        );
        if (res.success)
            printSuccess(
                `Đã miễn phạt ${res.data.amount.toLocaleString()} VND cho thành viên.`,
            );
        else printError(res.error);
    }

    private viewAuditLog() {
        const logs = this.auditService.getLogs();
        if (logs.length === 0) {
            console.log("  (Chưa có hoạt động nào được ghi nhận)\n");
        } else {
            console.log();
            logs.slice()
                .reverse()
                .forEach((l) => {
                    console.log(
                        `  [${new Date(l.timestamp).toLocaleString()}] ${l.action}`,
                    );
                    console.log(
                        `    Actor: ${l.actorId} → Target: ${l.targetId}${l.note ? ` | Note: ${l.note}` : ""}`,
                    );
                });
            console.log();
        }
    }

    private viewActiveLoans() {
        const loans = this.borrowingService.getAllActiveLoans();
        if (loans.length === 0) {
            console.log("\n  (Hiện không có sách nào đang được mượn)\n");
            return;
        }

        const sorted = loans.slice().sort((a, b) => {
            if (a.status === LoanStatus.OVERDUE && b.status !== LoanStatus.OVERDUE) return -1;
            if (a.status !== LoanStatus.OVERDUE && b.status === LoanStatus.OVERDUE) return 1;
            return 0;
        });

        const now = dateUtils.now();
        console.log(`\n  📋 Danh sách sách đang mượn (${loans.length} giao dịch):\n`);

        sorted.forEach((l) => {
            const member = this.memberRepo.findById(l.memberId);
            const memberName = member ? member.name : "(không rõ)";
            const isOverdue = l.status === LoanStatus.OVERDUE;
            const daysOverdue = isOverdue
                ? Math.floor((now.getTime() - new Date(l.dueDate).getTime()) / (1000 * 60 * 60 * 24))
                : 0;

            const statusLabel = isOverdue
                ? `⚠️  OVERDUE (${daysOverdue} ngày)`
                : "✅ ACTIVE";

            console.log(`  Loan ID : ${l.id}`);
            console.log(`  Barcode : ${l.bookCopyBarcode}`);
            console.log(`  Thành viên: [${l.memberId}] ${memberName}`);
            console.log(`  Ngày mượn : ${new Date(l.borrowDate).toLocaleDateString()}`);
            console.log(`  Hạn trả  : ${new Date(l.dueDate).toLocaleDateString()}`);
            console.log(`  Trạng thái: ${statusLabel}`);
            if (l.fineAmount > 0)
                console.log(`  Tiền phạt : ${l.fineAmount.toLocaleString()} VND`);
            console.log();
        });
    }
}
