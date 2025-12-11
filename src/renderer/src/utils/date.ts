export const getMonthAsString = (month: number): string => {
    const months = [
        'января',
        'февраля',
        'марта',
        'апреля',
        'мая',
        'июня',
        'июля',
        'августа',
        'сентября',
        'октября',
        'ноября',
        'декабря',
    ];

    return months[month];
}

export const formatDate = (
    date: Date,
    format: string = 'dd.MM.yyyy hh:mm',
): string => {
    const f = (digit: number, length: number = 2): string => {
        return digit.toString().padStart(length, '0');
    };

    const yyyy = date.getFullYear();
    const yy = +yyyy.toString().slice(-2);
    const MM = date.getMonth() + 1;
    const MMMM = getMonthAsString(MM);
    const dd = date.getDate();

    const hh = date.getHours();
    const mm = date.getMinutes();
    const ss = date.getSeconds();

    format = format.replace(/yyyy/g, f(yyyy, 4));
    format = format.replace(/yy/g, f(yy, 2));
    format = format.replace(/MMMM/g, MMMM);
    format = format.replace(/MM/g, f(MM, 2));
    format = format.replace(/dd/g, f(dd, 2));
    format = format.replace(/hh/g, f(hh, 2));
    format = format.replace(/mm/g, f(mm, 2));
    format = format.replace(/ss/g, f(ss, 2));

    return format;
};
