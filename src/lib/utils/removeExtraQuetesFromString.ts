export const removeExtraQuetesFromString = (value: string) => {
    return value.replace(/^"|"$/g, '');
};
