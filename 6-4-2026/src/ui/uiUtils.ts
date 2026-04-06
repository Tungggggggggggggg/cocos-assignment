import * as readlineSync from "readline-sync";
import { MemberTier } from "../types/enums";

export const ask = async (question: string): Promise<string> => {
    return readlineSync.question(question);
};

export const askPassword = (question: string): string => {
    return readlineSync.question(question, {
        hideEchoBack: true,
        mask: '*',
    });
};

export const printLine = () => console.log("─".repeat(50));
export const printHeader = (text: string) => {
    printLine();
    console.log(`  📚 ${text}`);
    printLine();
};
export const printSuccess = (msg: string) => console.log(`\n  ✅ ${msg}\n`);
export const printError = (msg: string) => console.log(`\n  ❌ Lỗi: ${msg}\n`);

export function parseTier(input: string): MemberTier | null {
    const key = input.trim().toUpperCase();
    if (key in MemberTier) return MemberTier[key as keyof typeof MemberTier];
    return null;
}
