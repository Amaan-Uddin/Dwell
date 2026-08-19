export function assertRequireParam(value: string | undefined | null, fieldName: string): asserts value is string {
    if (!value || !value?.trim()) throw new Error(`${fieldName} is required for this operation.`)
}