const getValidNumber = (value: number) => isNaN(value) ? 0 : Number(value).toFixed(1);

const getPercentage = (part: number, total: number) => getValidNumber(Number((part / total) * 100));

export {
    getPercentage,
    getValidNumber
}