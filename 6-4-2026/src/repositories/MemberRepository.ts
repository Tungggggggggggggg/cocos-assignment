import { Database } from "./Database";
import { Member } from "../models/Member";

export class MemberRepository {
    private db = Database.getInstance();

    save(member: Member): void {
        const index = this.db.data.members.findIndex((m) => m.id === member.id);
        if (index >= 0) this.db.data.members[index] = member;
        else this.db.data.members.push(member);
        this.db.save();
    }

    findById(id: string): Member | undefined {
        return this.db.data.members.find((m) => m.id === id);
    }

    findByEmail(email: string): Member | undefined {
        return this.db.data.members.find((m) => m.email === email);
    }

    findAll(): Member[] {
        return this.db.data.members;
    }
}
