import { PAYMENT_METHOD_OPTIONS } from '../constants';

export interface StudentPayment {
    studentName?:  string;
    type:          string | null;
    operationDate: Date | null;
    incomeAmount:  number;
    expenseAmount: number;
    group?:        string;
    teacherName?:  string;
    paymentMethod: number | null;
    description?:  string;
}

export const getLessonTypeFullName = (shortCode: string | undefined, lessonShortcuts: LessonShortcut[]): string | null => {
    if (!shortCode) {
        return null;
    }

    const lessonType = lessonShortcuts.find(item => item.key.toLowerCase() === shortCode.toLowerCase());
    return lessonType ? lessonType.value : null;
};

export const getPaymentMethod = (shortCode?: string): number | null => {
    if (!shortCode) {
        return null;
    }

    const lowerCaseCode = shortCode.toLowerCase();
    if (lowerCaseCode === 'н') {
        return PAYMENT_METHOD_OPTIONS.cash;
    }
    else if (lowerCaseCode === 'б') {
        return PAYMENT_METHOD_OPTIONS.cashless;
    }

    return null;
};

export const parseExcel = async (filePath: string, lessonShortcuts: LessonShortcut[], password?: string): Promise<StudentPayment[]> => {
    try {
        const rows = await window.api.readExcelWithPassword(filePath, password);

        const payments: StudentPayment[] = [];

        rows.map((row, rowNumber) => {
            // Skip header row
            if (rowNumber === 0) {
                return;
            }

            payments.push({
                studentName:   row[1],
                type:          getLessonTypeFullName(row[2], lessonShortcuts),
                group:         row[3],
                teacherName:   row[4],
                operationDate: row[5] || null,
                incomeAmount:  row[6] || 0,
                paymentMethod: getPaymentMethod(row[7]),
                expenseAmount: row[8] || 0,
                description:   row[9],
            });
        });

        return payments;
    }
    catch (error) {
        console.log('Error parsing excel file:', error);
        throw error;
    }
};
