import { MemberRepository } from "../repositories/MemberRepository";
import { Member } from "../models/Member";
import { MemberTier, MemberStatus } from "../types/enums";
import { idGenerator } from "../utils/idGenerator";
import { dateUtils } from "../utils/dateUtils";
import { Result, success, failure } from "../utils/Result";

import { AuthService } from "./AuthService";

export class MemberService {
    private repo = new MemberRepository();

    constructor(private authService: AuthService) {}

    registerMember(
        name: string,
        email: string,
        passwordRaw: string,
        tier: MemberTier = MemberTier.STANDARD,
    ): Result<Member> {
        if (this.repo.findByEmail(email))
            return failure(
                "Email already registered",
                "BUSINESS_RULE_VIOLATION",
            );

        const memberSince = dateUtils.now();
        const expiryDate = dateUtils.addDays(memberSince, 365);

        const passwordHash = this.authService.hashPassword(passwordRaw);

        const member: Member = {
            id: idGenerator.generateId(),
            name,
            email,
            passwordHash,
            tier,
            status: MemberStatus.ACTIVE,
            unpaidFineIds: [], 
            paidFineIds: [],
            memberSince,
            expiryDate,
        };
        this.repo.save(member);
        return success(member);
    }

    suspendMember(id: string): Result<Member> {
        const member = this.repo.findById(id);
        if (!member) return failure("Member not found", "NOT_FOUND");
        member.status = MemberStatus.SUSPENDED;
        this.repo.save(member);
        return success(member);
    }

    activateMember(id: string): Result<Member> {
        const member = this.repo.findById(id);
        if (!member) return failure("Member not found", "NOT_FOUND");
        if (member.unpaidFineIds.length > 0)
            return failure(
                "Cannot activate member with unpaid fines",
                "BUSINESS_RULE_VIOLATION",
            );
        member.status = MemberStatus.ACTIVE;
        this.repo.save(member);
        return success(member);
    }

    changeTier(memberId: string, newTier: MemberTier): Result<Member> {
        const member = this.repo.findById(memberId);
        if (!member) return failure("Member not found", "NOT_FOUND");
        member.tier = newTier;
        this.repo.save(member);
        return success(member);
    }

    findAll(): Member[] {
        return this.repo.findAll();
    }
}
