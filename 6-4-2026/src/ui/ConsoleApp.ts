import { ask, printHeader, printLine, printError, printSuccess, askPassword } from "./uiUtils";
import { LibrarianController } from "./controllers/LibrarianController";
import { MemberController } from "./controllers/MemberController";
import { AuditService } from "../services/AuditService";
import { FineService } from "../services/FineService";
import { ReservationService } from "../services/ReservationService";
import { CatalogService } from "../services/CatalogService";
import { MemberService } from "../services/MemberService";
import { BorrowingService } from "../services/BorrowingService";
import { AuthService } from "../services/AuthService";
import { MemberTier } from "../types/enums";
import { Member } from "../models/Member";

export class ConsoleApp {
    private auditService = new AuditService();
    private authService = new AuthService(this.auditService);
    private fineService = new FineService(this.auditService);
    private reservationService = new ReservationService(this.auditService);
    private catalogService = new CatalogService();
    private memberService = new MemberService(this.authService);
    private borrowingService = new BorrowingService(
        this.auditService,
        this.fineService,
        this.reservationService,
    );

    private librarianCtrl = new LibrarianController(
        this.catalogService,
        this.memberService,
        this.auditService,
        this.fineService,
        this.borrowingService, 
    );
    private memberCtrl = new MemberController(
        this.borrowingService,
        this.reservationService,
        this.catalogService,
        this.fineService,
    );

    private currentUser: Member | null = null;

    async start() {
        console.log("\n  ╔══════════════════════════════════╗");
        console.log("  ║   HỆ THỐNG QUẢN LÝ THƯ VIỆN  📚  ║");
        console.log("  ╚══════════════════════════════════╝\n");

        this.reservationService.expireStale();

        while (true) {
            printHeader("TRANG CHỦ");
            console.log("  1. Đăng nhập");
            console.log("  2. Đăng ký thành viên mới");
            console.log("  0. Thoát");
            printLine();

            const choice = await ask("  Lựa chọn của bạn (0-2): ");
            switch (choice.trim()) {
                case "1":
                    await this.loginFlow();
                    break;
                case "2":
                    await this.registerFlow();
                    break;
                case "0":
                    console.log("\n  Tạm biệt! Hẹn gặp lại 👋\n");
                    process.exit(0);
                    break;
                default:
                    printError("Lựa chọn không hợp lệ. Vui lòng chọn 0, 1 hoặc 2.");
            }
        }
    }

    private async loginFlow() {
        printHeader("ĐĂNG NHẬP HỆ THỐNG");
        const email = await ask("  Email: ");
        const password = askPassword("  Mật khẩu: ");

        const res = this.authService.login(email.trim(), password);
        if (res.success) {
            this.currentUser = res.data;
            printSuccess(`Đăng nhập thành công! Chào mừng ${this.currentUser.name} (${this.currentUser.tier}).`);

            if (this.currentUser.tier === MemberTier.STAFF) {
                await this.librarianCtrl.showMenu();
            } else {
                await this.memberCtrl.showMenu(this.currentUser);
            }
            this.currentUser = null;
        } else {
            printError(res.error);
        }
    }

    private async registerFlow() {
        printHeader("ĐĂNG KÝ THÀNH VIÊN");
        const name = await ask("  Họ và tên: ");
        const email = await ask("  Email: ");
        const password = askPassword("  Mật khẩu: ");

        const res = this.memberService.registerMember(
            name.trim(),
            email.trim(),
            password,
            MemberTier.STANDARD
        );

        if (res.success) {
            printSuccess("Đăng ký thành công! Bạn có thể sử dụng email/mật khẩu vừa tạo để đăng nhập.");
        } else {
            printError(res.error);
        }
    }
}
