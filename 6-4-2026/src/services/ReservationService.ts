import { ReservationRepository } from "../repositories/ReservationRepository";
import { BookRepository } from "../repositories/BookRepository";
import { Reservation } from "../models/Reservation";
import { ReservationStatus, BookStatus } from "../types/enums";
import { idGenerator } from "../utils/idGenerator";
import { dateUtils } from "../utils/dateUtils";
import { LIBRARY_CONFIG } from "../config/libraryConfig";
import { Result, success, failure } from "../utils/Result";
import { AuditService } from "./AuditService";

export class ReservationService {
    private repo = new ReservationRepository();
    private bookRepo = new BookRepository();

    constructor(private auditService: AuditService) {}

    reserve(memberId: string, bookId: string): Result<Reservation> {
        const copies = this.bookRepo.findCopiesByBookId(bookId);
        if (copies.length === 0)
            return failure(
                "Không tìm thấy đầu sách này trong thư viện",
                "NOT_FOUND",
            );
        const hasAvailable = copies.some(
            (c) => c.status === BookStatus.AVAILABLE,
        );
        if (hasAvailable)
            return failure(
                "Sách vẫn còn bản sẵn sàng — không cần đặt trước, hãy mượn trực tiếp!",
                "BUSINESS_RULE_VIOLATION",
            );

        const existingPending = this.repo
            .findByMember(memberId)
            .find(
                (r) =>
                    r.bookId === bookId &&
                    r.status === ReservationStatus.PENDING,
            );
        if (existingPending)
            return failure(
                "Bạn đã đặt trước quyển sách này rồi",
                "BUSINESS_RULE_VIOLATION",
            );

        const res: Reservation = {
            id: idGenerator.generateId(),
            memberId,
            bookId,
            status: ReservationStatus.PENDING,
            createdAt: dateUtils.now(),
            expiryDate: dateUtils.addDays(
                dateUtils.now(),
                LIBRARY_CONFIG.reservationExpiryDays,
            ),
            notifiedAt: null,
        };
        this.repo.save(res);
        this.auditService.logAction(memberId, "RESERVE_BOOK", bookId);
        return success(res);
    }

    cancelReservation(memberId: string, reservationId: string): Result<Reservation> {
        const res = this.repo.findById(reservationId);
        if (!res) return failure("Không tìm thấy đặt trước", "NOT_FOUND");
        if (res.memberId !== memberId)
            return failure(
                "Bạn không có quyền hủy đặt trước này",
                "UNAUTHORIZED",
            );
        if (res.status !== ReservationStatus.PENDING)
            return failure(
                res.status === ReservationStatus.NOTIFIED
                    ? "Không thể hủy: Sách đã được thông báo sẵn sàng — vui lòng đến nhận hoặc đợi hết hạn."
                    : `Không thể hủy: Đặt trước đang ở trạng thái ${res.status}.`,
                "BUSINESS_RULE_VIOLATION",
            );

        res.status = ReservationStatus.CANCELLED;
        this.repo.save(res);
        this.auditService.logAction(memberId, "CANCEL_RESERVATION", reservationId);
        return success(res);
    }

    notifyNext(bookId: string): void {
        const reservations = this.repo
            .findByBook(bookId)
            .filter((r) => r.status === ReservationStatus.PENDING)
            .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

        if (reservations.length > 0) {
            const nextRes = reservations[0];
            nextRes.status = ReservationStatus.NOTIFIED;
            nextRes.notifiedAt = dateUtils.now();
            nextRes.expiryDate = dateUtils.addDays(
                dateUtils.now(),
                LIBRARY_CONFIG.reservationExpiryDays,
            );
            this.repo.save(nextRes);
            console.log(
                `\n  📣 [THÔNG BÁO HỆ THỐNG] Sách đã về! Thành viên (ID: ${nextRes.memberId}) vui lòng đến nhận trong ${LIBRARY_CONFIG.reservationExpiryDays} ngày.\n`,
            );
        }
    }

    getPendingByMember(memberId: string): Reservation[] {
        return this.repo
            .findByMember(memberId)
            .filter((r) => r.status === ReservationStatus.PENDING);
    }

    expireStale(): void {
        const all = this.repo.findAll();
        for (const r of all) {
            if (
                r.status === ReservationStatus.NOTIFIED &&
                dateUtils.now() > r.expiryDate
            ) {
                r.status = ReservationStatus.EXPIRED;
                this.repo.save(r);
                this.notifyNext(r.bookId);
            }
        }
    }
}
