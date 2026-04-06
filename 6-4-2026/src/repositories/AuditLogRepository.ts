import { Database } from "./Database";
import { AuditLog } from "../models/AuditLog";

export class AuditLogRepository {
    private db = Database.getInstance();

    save(log: AuditLog): void {
        this.db.data.auditLogs.push(log);
        this.db.save();
    }

    findAll(): AuditLog[] {
        return this.db.data.auditLogs;
    }
}
