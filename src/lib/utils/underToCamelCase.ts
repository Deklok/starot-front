// Utility function to convert under_score_case to camelCase
function toCamelCase(key: string): string {
    return key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

// Generic function to transform the input object
export function transformToCamelCase<T>(input: Record<string, any>): T {
    const result: Partial<T> = {};

    for (const key in input) {
        if (input.hasOwnProperty(key)) {
            const camelCaseKey = toCamelCase(key) as keyof T;
            result[camelCaseKey] = input[key];
        }
    }

    return result as T;
}