export type ErrorCode =
    | "NOT_FOUND"
    | "VALIDATION_ERROR"
    | "BUSINESS_RULE_VIOLATION"
    | "UNAUTHORIZED"
    | "INTERNAL_ERROR";

export type Result<T> =
    | { success: true; data: T }
    | { success: false; error: string; code: ErrorCode };

export function success<T>(data: T): Result<T> {
    return { success: true, data };
}

export function failure<T = any>(error: string, code: ErrorCode): Result<T> {
    return { success: false, error, code };
}
