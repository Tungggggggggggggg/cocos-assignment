import * as fs from "fs";
import * as path from "path";
import * as bcrypt from "bcryptjs";
import { Book } from "../models/Book";
import { BookCopy } from "../models/BookCopy";
import { Member } from "../models/Member";
import { LoanRecord } from "../models/LoanRecord";
import { Fine } from "../models/Fine";
import { Reservation } from "../models/Reservation";
import { AuditLog } from "../models/AuditLog";

interface Schema {
    books: Book[];
    bookCopies: BookCopy[];
    members: Member[];
    loans: LoanRecord[];
    fines: Fine[];
    reservations: Reservation[];
    auditLogs: AuditLog[];
}

const dbPath = path.join(__dirname, "../../data/database.json");

export class Database {
    private static instance: Database;
    public data: Schema;

    private constructor() {
        this.data = this.load();
    }

    public static getInstance(): Database {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }

    private load(): Schema {
        if (!fs.existsSync(dbPath)) {
            const dir = path.dirname(dbPath);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(
                dbPath,
                JSON.stringify(
                    {
                        books: [],
                        bookCopies: [],
                        members: [],
                        loans: [],
                        fines: [],
                        reservations: [],
                        auditLogs: [],
                    },
                    null,
                    2,
                ),
            );
        }

        const rawData = JSON.parse(fs.readFileSync(dbPath, "utf-8"));

        const reviveDatesInArray = (arr: any[], dateFields: string[]) => {
            arr.forEach((item) => {
                dateFields.forEach((field) => {
                    if (item[field]) item[field] = new Date(item[field]);
                });

                if (item.renewalHistory && Array.isArray(item.renewalHistory)) {
                    item.renewalHistory = item.renewalHistory.map(
                        (d: string) => new Date(d),
                    );
                }
            });
        };

        reviveDatesInArray(rawData.members, ["memberSince", "expiryDate"]);
        reviveDatesInArray(rawData.loans, [
            "borrowDate",
            "dueDate",
            "returnDate",
        ]);
        reviveDatesInArray(rawData.fines, ["createdAt", "paidAt"]);
        reviveDatesInArray(rawData.reservations, [
            "createdAt",
            "expiryDate",
            "notifiedAt",
        ]);
        reviveDatesInArray(rawData.auditLogs, ["timestamp"]);

        let needsSave = false;
        if (rawData.members && Array.isArray(rawData.members)) {
            rawData.members.forEach((m: any) => {
                if (!m.passwordHash) {
                    m.passwordHash = bcrypt.hashSync("123456", 10);
                    needsSave = true;
                }
            });
        }

        const schema = rawData as Schema;
        
        if (needsSave) {
            try {
                fs.writeFileSync(dbPath, JSON.stringify(schema, null, 2), "utf-8");
            } catch (err) {
                console.error("Lỗi khi vá data passwordHash:", err);
            }
        }

        return schema;
    }

    public save(): void {
        try {
            fs.writeFileSync(dbPath, JSON.stringify(this.data, null, 2), "utf-8");
        } catch (err) {
            console.error("\n  ❌ [DATABASE ERROR] Không thể ghi dữ liệu vào disk:", err);
            throw new Error("Database write failed — dữ liệu chưa được lưu.");
        }
    }
}
