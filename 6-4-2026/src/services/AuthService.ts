import * as bcrypt from "bcryptjs";
import { MemberRepository } from "../repositories/MemberRepository";
import { AuditService } from "./AuditService";
import { Member } from "../models/Member";
import { Result, success, failure } from "../utils/Result";
import { MemberStatus } from "../types/enums";
import { dateUtils } from "../utils/dateUtils";

interface LockoutState {
    attempts: number;
    lockoutUntil: Date | null;
}

export class AuthService {
    private memberRepo = new MemberRepository();
    private lockouts: Map<string, LockoutState> = new Map();
    
    private readonly MAX_ATTEMPTS = 5;
    private readonly LOCKOUT_MINUTES = 15;

    constructor(private auditService: AuditService) {}

    hashPassword(password: string): string {
        return bcrypt.hashSync(password, 10);
    }

    verifyPassword(password: string, hash: string): boolean {
        return bcrypt.compareSync(password, hash);
    }

    login(email: string, password: string): Result<Member> {
        const member = this.memberRepo.findByEmail(email);

        if (!member) {
            return failure("Email không tồn tại.", "NOT_FOUND");
        }

        const now = dateUtils.now();
        const lockoutState = this.lockouts.get(email) || { attempts: 0, lockoutUntil: null };

        if (lockoutState.lockoutUntil && lockoutState.lockoutUntil > now) {
            const minsLeft = Math.ceil((lockoutState.lockoutUntil.getTime() - now.getTime()) / 60000);
            return failure(`Tài khoản đang bị khóa tạm thời. Vui lòng thử lại sau ${minsLeft} phút.`, "UNAUTHORIZED");
        } else if (lockoutState.lockoutUntil && lockoutState.lockoutUntil <= now) {
            lockoutState.attempts = 0;
            lockoutState.lockoutUntil = null;
        }

        const isValid = this.verifyPassword(password, member.passwordHash);

        if (!isValid) {
            lockoutState.attempts++;
            if (lockoutState.attempts >= this.MAX_ATTEMPTS) {
                lockoutState.lockoutUntil = new Date(now.getTime() + this.LOCKOUT_MINUTES * 60000);
                this.lockouts.set(email, lockoutState);
                this.auditService.logAction(member.id, "LOGIN_FAILED", "Bị khóa tạm thời do sai mật khẩu 5 lần");
                return failure("Mật khẩu không chính xác. Tài khoản của bạn đã bị khóa tạm thời 15 phút.", "UNAUTHORIZED");
            }
            
            this.lockouts.set(email, lockoutState);
            this.auditService.logAction(member.id, "LOGIN_FAILED", "Sai mật khẩu");
            const left = this.MAX_ATTEMPTS - lockoutState.attempts;
            return failure(`Mật khẩu không chính xác. Bạn còn ${left} lần thử.`, "UNAUTHORIZED");
        }

        this.lockouts.delete(email);

        if (member.status === MemberStatus.SUSPENDED) {
            console.log("\n  ⚠️ LƯU Ý: Tài khoản của bạn hiện đang bị KHOÁ. Hãy thanh toán tiền phạt để có thể mượn sách.\n");
        }

        this.auditService.logAction(member.id, "LOGIN_SUCCESS", "Đăng nhập thành công");
        return success(member);
    }
}
