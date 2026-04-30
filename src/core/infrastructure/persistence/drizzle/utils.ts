import { DrizzleError, DrizzleQueryError } from "drizzle-orm"

export function drizzleErrorLogger(error: unknown, context: Record<string, unknown>): void {
    const logData = { ...context, timestamp: new Date().toISOString() }

    if (error instanceof DrizzleQueryError) {
        console.error("Query Error::", {
            ...logData,
            query: error.query,
            message: error.cause?.message
        })
    } else if (error instanceof DrizzleError) {
        console.error("Drizzle Error::", {
            ...logData,
            message: error.message
        })
    } else if (error instanceof Error) {
        console.error("Unexpected Error::", {
            ...logData,
            message: error.message
        })
    } else {
        console.error("Non-error thrown::", { ...logData, error })
    }
}