import { AuditLogRepository } from "../repositories/AuditLogRepository";
import { AuditLog } from "../models/AuditLog";
import { idGenerator } from "../utils/idGenerator";
import { dateUtils } from "../utils/dateUtils";

export class AuditService {
    private repo = new AuditLogRepository();

    logAction(
        actorId: string,
        action: string,
        targetId: string,
        note?: string,
    ): void {
        const log: AuditLog = {
            id: idGenerator.generateId(),
            actorId,
            action,
            targetId,
            timestamp: dateUtils.now(),
            note: note || null,
        };
        this.repo.save(log);
    }

    getLogs(): AuditLog[] {
        return this.repo.findAll();
    }
}
