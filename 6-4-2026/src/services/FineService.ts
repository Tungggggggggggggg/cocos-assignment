import { FineRepository } from "../repositories/FineRepository";
import { MemberRepository } from "../repositories/MemberRepository";
import { Fine } from "../models/Fine";
import { MemberStatus } from "../types/enums";
import { LIBRARY_CONFIG } from "../config/libraryConfig";
import { Result, success, failure } from "../utils/Result";
import { idGenerator } from "../utils/idGenerator";
import { dateUtils } from "../utils/dateUtils";
import { AuditService } from "./AuditService";

export class FineService {
    private fineRepo = new FineRepository();
    private memberRepo = new MemberRepository();

    constructor(private auditService: AuditService) {}

    calculateFineAmount(daysLate: number): number {
        if (daysLate <= 0) return 0;
        return Math.min(
            daysLate * LIBRARY_CONFIG.finePerDay,
            LIBRARY_CONFIG.fineMaxCap,
        );
    }

    createFine(
        memberId: string,
        loanId: string,
        daysLate: number,
    ): Fine | null {
        const amount = this.calculateFineAmount(daysLate);
        if (amount <= 0) return null;

        const fine: Fine = {
            id: idGenerator.generateId(),
            loanId,
            memberId,
            amount,
            reason: "overdue",
            createdAt: dateUtils.now(),
            paidAt: null,
            waivedBy: null,
        };

        this.fineRepo.save(fine);

        const member = this.memberRepo.findById(memberId);
        if (member) {
            member.unpaidFineIds.push(fine.id);
            member.status = MemberStatus.SUSPENDED;
            this.memberRepo.save(member);
        }
        return fine;
    }

    payFine(memberId: string, fineId: string): Result<Fine> {
        const fine = this.fineRepo.findById(fineId);
        if (!fine) return failure("Fine not found", "NOT_FOUND");
        if (fine.memberId !== memberId)
            return failure("Not your fine", "UNAUTHORIZED");
        if (fine.paidAt || fine.waivedBy)
            return failure("Fine already settled", "BUSINESS_RULE_VIOLATION");

        fine.paidAt = dateUtils.now();
        this.fineRepo.save(fine);

        const member = this.memberRepo.findById(memberId);
        if (member) {
            member.unpaidFineIds = member.unpaidFineIds.filter(
                (id) => id !== fineId,
            );
            member.paidFineIds.push(fineId);

            if (member.unpaidFineIds.length === 0) {
                member.status = MemberStatus.ACTIVE;
            }
            this.memberRepo.save(member);
        }

        this.auditService.logAction(memberId, "PAY_FINE", fineId);
        return success(fine);
    }

    waiveFine(
        memberId: string,
        fineId: string,
        librarianId: string,
        note: string,
    ): Result<Fine> {
        const fine = this.fineRepo.findById(fineId);
        if (!fine) return failure("Fine not found", "NOT_FOUND");
        if (fine.paidAt || fine.waivedBy)
            return failure("Fine already settled", "BUSINESS_RULE_VIOLATION");

        fine.waivedBy = librarianId;
        this.fineRepo.save(fine);

        const member = this.memberRepo.findById(memberId);
        if (member) {
            member.unpaidFineIds = member.unpaidFineIds.filter(
                (id) => id !== fineId,
            );
            member.paidFineIds.push(fineId);

            if (member.unpaidFineIds.length === 0) {
                member.status = MemberStatus.ACTIVE;
            }
            this.memberRepo.save(member);
        }

        this.auditService.logAction(librarianId, "WAIVE_FINE", fineId, note);
        return success(fine);
    }
}
