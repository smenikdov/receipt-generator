export const declineWord = (number: number, word1: string, word2: string, word5: string) => {
    let lastDigit = number % 10;
    if (number % 100 >= 11 && number % 100 <= 19) {
        return word5;
    } else if (lastDigit === 1) {
        return word1;
    } else if (lastDigit >= 2 && lastDigit <= 4) {
        return word2;
    } else {
        return word5;
    }
};
