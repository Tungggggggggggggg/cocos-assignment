import { BookRepository } from "../repositories/BookRepository";
import { MemberRepository } from "../repositories/MemberRepository";
import { LoanRepository } from "../repositories/LoanRepository";
import { FineRepository } from "../repositories/FineRepository";
import { LoanRecord } from "../models/LoanRecord";
import { Fine } from "../models/Fine";
import {
    BookStatus,
    MemberStatus,
    LoanStatus,
    ReservationStatus,
} from "../types/enums";
import { LIBRARY_CONFIG } from "../config/libraryConfig";
import { Result, success, failure } from "../utils/Result";
import { idGenerator } from "../utils/idGenerator";
import { dateUtils } from "../utils/dateUtils";
import { AuditService } from "./AuditService";
import { FineService } from "./FineService";
import { ReservationService } from "./ReservationService";
import { ReservationRepository } from "../repositories/ReservationRepository";

export class BorrowingService {
    private bookRepo = new BookRepository();
    private memberRepo = new MemberRepository();
    private loanRepo = new LoanRepository();
    private fineRepo = new FineRepository();
    private reservationRepo = new ReservationRepository();

    constructor(
        private auditService: AuditService,
        private fineService: FineService,
        private reservationService: ReservationService,
    ) {}

    private markOverdueLoans(): void {
        const now = dateUtils.now();
        const active = this.loanRepo.findAllActiveAndOverdue();
        for (const loan of active) {
            if (loan.status === LoanStatus.ACTIVE && now > loan.dueDate) {
                loan.status = LoanStatus.OVERDUE;
                this.loanRepo.save(loan);
            }
        }
    }

    checkOut(memberId: string, barcode: string): Result<LoanRecord> {
        this.reservationService.expireStale();
        this.markOverdueLoans();

        const member = this.memberRepo.findById(memberId);
        if (!member) return failure("Không tìm thấy thành viên", "NOT_FOUND");

        if (member.status === MemberStatus.SUSPENDED) {
            return failure(
                "Tài khoản bị khoá do còn tiền phạt chưa đóng. Vui lòng thanh toán tại mục [7].",
                "BUSINESS_RULE_VIOLATION",
            );
        }

        const activeLoansForCheck = this.loanRepo.findActiveByMember(memberId);
        const hasOverdue = activeLoansForCheck.some(
            (l) =>
                l.status === LoanStatus.OVERDUE ||
                dateUtils.diffDaysSigned(dateUtils.now(), l.dueDate) > 0,
        );
        if (hasOverdue) {
            return failure(
                "Bạn đang giữ ấn phẩm quá hạn chưa trả. Vui lòng hoàn trả trước khi mượn mới.",
                "BUSINESS_RULE_VIOLATION",
            );
        }

        if (dateUtils.now() > member.expiryDate) {
            return failure(
                "Thẻ thành viên đã hết hạn. Vui lòng liên hệ thủ thư để gia hạn.",
                "BUSINESS_RULE_VIOLATION",
            );
        }

        const tierConfig = LIBRARY_CONFIG.tiers[member.tier];
        if (activeLoansForCheck.length >= tierConfig.maxBooks) {
            return failure(
                `Bạn đã đạt giới hạn mượn (${tierConfig.maxBooks} cuốn) của hạng thẻ ${member.tier}.`,
                "BUSINESS_RULE_VIOLATION",
            );
        }

        const copy = this.bookRepo.findCopyByBarcode(barcode);
        if (!copy)
            return failure(
                `Không tìm thấy ấn phẩm với Barcode: ${barcode}`,
                "NOT_FOUND",
            );

        if (copy.status === BookStatus.ON_HOLD) {
            const reservations = this.reservationRepo.findByBook(copy.bookId);
            const notifiedRes = reservations.find(
                (r) => r.status === ReservationStatus.NOTIFIED,
            );
            if (!notifiedRes || notifiedRes.memberId !== memberId) {
                return failure(
                    "Ấn phẩm này đang được giữ chỗ (ON_HOLD) cho thành viên khác đã được thông báo.",
                    "BUSINESS_RULE_VIOLATION",
                );
            }
            notifiedRes.status = ReservationStatus.FULFILLED;
            this.reservationRepo.save(notifiedRes);
        } else if (copy.status !== BookStatus.AVAILABLE) {
            return failure(
                `Ấn phẩm này đang ở trạng thái: ${copy.status} — không thể mượn.`,
                "BUSINESS_RULE_VIOLATION",
            );
        } else {
            const reservations = this.reservationRepo.findByBook(copy.bookId);
            const notifiedRes = reservations.find(
                (r) => r.status === ReservationStatus.NOTIFIED,
            );
            if (notifiedRes && notifiedRes.memberId !== memberId) {
                return failure(
                    "Ấn phẩm này đang được giữ chỗ cho thành viên khác.",
                    "BUSINESS_RULE_VIOLATION",
                );
            } else if (notifiedRes && notifiedRes.memberId === memberId) {
                notifiedRes.status = ReservationStatus.FULFILLED;
                this.reservationRepo.save(notifiedRes);
            }
        }

        const now = dateUtils.now();
        const loan: LoanRecord = {
            id: idGenerator.generateId(),
            bookCopyBarcode: barcode,
            memberId,
            borrowDate: now,
            dueDate: dateUtils.addDays(now, tierConfig.loanDays),
            returnDate: null,
            status: LoanStatus.ACTIVE,
            renewCount: 0,
            renewalHistory: [],
            fineAmount: 0,
        };

        copy.status = BookStatus.BORROWED;
        this.bookRepo.saveCopy(copy);
        this.loanRepo.save(loan);

        const memberPendingRes = this.reservationRepo
            .findByMember(memberId)
            .find(
                (r) =>
                    r.bookId === copy.bookId &&
                    r.status === ReservationStatus.PENDING,
            );
        if (memberPendingRes) {
            memberPendingRes.status = ReservationStatus.FULFILLED;
            this.reservationRepo.save(memberPendingRes);
        }

        this.auditService.logAction(memberId, "CHECK_OUT", barcode);
        return success(loan);
    }

    checkIn(barcode: string): Result<LoanRecord> {
        this.markOverdueLoans();

        const loan = this.loanRepo.findActiveByBarcode(barcode);
        if (!loan)
            return failure(
                `Không tìm thấy giao dịch mượn đang hoạt động cho Barcode: ${barcode}`,
                "NOT_FOUND",
            );

        const copy = this.bookRepo.findCopyByBarcode(barcode);
        if (!copy) return failure("Không tìm thấy ấn phẩm", "NOT_FOUND");

        const now = dateUtils.now();
        loan.returnDate = now;
        loan.status = LoanStatus.RETURNED;

        const daysLate = dateUtils.diffDaysSigned(now, loan.dueDate);
        if (daysLate > 0) {
            const fine = this.fineService.createFine(
                loan.memberId,
                loan.id,
                daysLate,
            );
            if (fine) {
                loan.fineAmount = fine.amount;
            }
        }

        const pendingReservationsForBook = this.reservationRepo
            .findByBook(copy.bookId)
            .filter((r) => r.status === ReservationStatus.PENDING);

        if (pendingReservationsForBook.length > 0) {
            copy.status = BookStatus.ON_HOLD;
        } else {
            copy.status = BookStatus.AVAILABLE;
        }

        this.loanRepo.save(loan);
        this.bookRepo.saveCopy(copy);

        this.auditService.logAction("SYSTEM", "CHECK_IN", barcode);

        this.reservationService.notifyNext(copy.bookId);

        return success(loan);
    }

    renewLoan(loanId: string): Result<LoanRecord> {
        this.markOverdueLoans();

        const loan = this.loanRepo.findById(loanId);
        if (!loan || loan.status !== LoanStatus.ACTIVE)
            return failure(
                "Không tìm thấy giao dịch mượn đang hoạt động",
                "NOT_FOUND",
            );

        const copy = this.bookRepo.findCopyByBarcode(loan.bookCopyBarcode);
        if (!copy) return failure("Không tìm thấy ấn phẩm", "NOT_FOUND");

        const pendingReservations = this.reservationRepo
            .findByBook(copy.bookId)
            .filter((r) => r.status === ReservationStatus.PENDING);
        if (pendingReservations.length > 0) {
            return failure(
                "Không thể gia hạn: Có thành viên khác đang đặt trước quyển sách này.",
                "BUSINESS_RULE_VIOLATION",
            );
        }

        if (loan.renewCount >= LIBRARY_CONFIG.maxRenewals) {
            return failure(
                `Đã đạt giới hạn gia hạn (${LIBRARY_CONFIG.maxRenewals} lần).`,
                "BUSINESS_RULE_VIOLATION",
            );
        }

        const member = this.memberRepo.findById(loan.memberId);
        if (!member) return failure("Không tìm thấy thành viên", "NOT_FOUND");
        if (member.status === MemberStatus.SUSPENDED)
            return failure(
                "Không thể gia hạn: Tài khoản đang bị khoá.",
                "BUSINESS_RULE_VIOLATION",
            );

        const now = dateUtils.now();
        if (dateUtils.diffDaysSigned(now, loan.dueDate) > 0) {
            return failure(
                "Không thể gia hạn: Sách đã quá hạn, vui lòng trả sách trước.",
                "BUSINESS_RULE_VIOLATION",
            );
        }

        const tierConfig = LIBRARY_CONFIG.tiers[member.tier];
        loan.dueDate = dateUtils.addDays(loan.dueDate, tierConfig.loanDays);
        loan.renewCount++;
        loan.renewalHistory.push(now);

        this.loanRepo.save(loan);
        this.auditService.logAction(loan.memberId, "RENEW_LOAN", loan.id);

        return success(loan);
    }

    reportLostBook(memberId: string, barcode: string): Result<LoanRecord> {
        const loan = this.loanRepo.findActiveByBarcode(barcode);
        if (!loan)
            return failure(
                `Không tìm thấy giao dịch mượn đang hoạt động cho Barcode: ${barcode}`,
                "NOT_FOUND",
            );
        if (loan.memberId !== memberId)
            return failure(
                "Bạn không phải người đang mượn ấn phẩm này.",
                "UNAUTHORIZED",
            );

        const copy = this.bookRepo.findCopyByBarcode(barcode);
        if (!copy) return failure("Không tìm thấy ấn phẩm", "NOT_FOUND");

        const member = this.memberRepo.findById(memberId);
        if (!member) return failure("Không tìm thấy thành viên", "NOT_FOUND");

        const now = dateUtils.now();

        copy.status = BookStatus.LOST;
        this.bookRepo.saveCopy(copy);

        // Đóng khoản vay
        loan.status = LoanStatus.RETURNED;
        loan.returnDate = now;
        this.loanRepo.save(loan);

        const lostFineAmount = LIBRARY_CONFIG.lostBookFine;
        const fine: Fine = {
            id: idGenerator.generateId(),
            loanId: loan.id,
            memberId,
            amount: lostFineAmount,
            reason: "lost",
            createdAt: now,
            paidAt: null,
            waivedBy: null,
        };
        this.fineRepo.save(fine);

        member.unpaidFineIds.push(fine.id);
        member.status = MemberStatus.SUSPENDED;
        this.memberRepo.save(member);

        this.auditService.logAction(memberId, "REPORT_LOST", barcode, `Fine: ${lostFineAmount.toLocaleString()} VND`);
        return success(loan);
    }

    getActiveLoansByMember(memberId: string): LoanRecord[] {
        return this.loanRepo.findActiveByMember(memberId);
    }

    getAllActiveLoans(): LoanRecord[] {
        return this.loanRepo.findAllActiveAndOverdue();
    }
}
