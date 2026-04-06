import { Database } from "./Database";
import { Fine } from "../models/Fine";

export class FineRepository {
    private db = Database.getInstance();

    save(fine: Fine): void {
        const index = this.db.data.fines.findIndex((f) => f.id === fine.id);
        if (index >= 0) this.db.data.fines[index] = fine;
        else this.db.data.fines.push(fine);
        this.db.save();
    }

    findById(id: string): Fine | undefined {
        return this.db.data.fines.find((f) => f.id === id);
    }

    findByMember(memberId: string): Fine[] {
        return this.db.data.fines.filter((f) => f.memberId === memberId);
    }
}
