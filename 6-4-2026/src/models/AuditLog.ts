export interface AuditLog {
    id: string;
    actorId: string;
    action: string;
    targetId: string;
    timestamp: Date;
    note: string | null;
}
