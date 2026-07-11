// Fisher–Yates. Render-time only: canonical order stays in storage, so stats
// are unaffected by the order a respondent happened to see.
export const shuffle = <T>(items: T[]): T[] => {
    const result = [...items];

    for (let index = result.length - 1; index > 0; index--) {
        const swap = Math.floor(Math.random() * (index + 1));
        [result[index], result[swap]] = [result[swap], result[index]];
    }

    return result;
};
