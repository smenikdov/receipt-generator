export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function getOptionsFromConstants(constants: Record<string, string | number>) {
    const options: { label: string; value: number }[] = [];

    for (const key in constants) {
        if (!isNaN(+key)) {
            options.push({
                label: constants[key] as string,
                value: +key,
            });
        }
    }

    return options;
};
