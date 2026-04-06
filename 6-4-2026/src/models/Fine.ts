export interface Fine {
    id: string;
    loanId: string;
    memberId: string;
    amount: number;
    reason: "overdue" | "lost";
    createdAt: Date;
    paidAt: Date | null;
    waivedBy: string | null;
}
