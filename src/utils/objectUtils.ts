export const mapToArr = <T = string>(tagMap: Map<string, T>) => {
    const result: { key: string; value: T }[] = [];
    for (const [key, value] of tagMap) {
        result.push({
            key,
            value,
        });
    }
    return result;
};
