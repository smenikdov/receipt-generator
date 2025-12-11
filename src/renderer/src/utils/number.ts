import { convert as convertNumberToWordsRu } from 'number-to-words-ru';

export const number2string = (num: number) => {
    if (Number.isInteger(+num)) {
        return convertNumberToWordsRu(num, {
            showNumberParts: {
                integer: true,
                fractional: false,
            },
            showCurrency: {
                integer: false,
            },
            // @ts-ignore
            currencyNounGender: {
                integer: 0,
            },
        });
    }
    else {
        return convertNumberToWordsRu(num, {
            currency: 'number',
            convertNumberToWords: {
                integer: true,
                fractional: true,
            },
            showNumberParts: {
                integer: true,
                fractional: true,
            },
        });
    }
}

