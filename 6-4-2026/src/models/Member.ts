import { MemberTier, MemberStatus } from "../types/enums";

export interface Member {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    tier: MemberTier;
    status: MemberStatus;
    unpaidFineIds: string[]; 
    paidFineIds: string[]; 
    memberSince: Date;
    expiryDate: Date;
}
