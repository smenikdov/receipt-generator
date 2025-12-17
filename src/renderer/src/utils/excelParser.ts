import * as ExcelJS from 'exceljs';
import { readFileAsync } from './files';

export interface StudentPayment {
    studentName?:  string;
    type:          string | null;
    operationDate: Date | null;
    incomeAmount:  number;
    expenseAmount: number;
    group?:        string;
    teacherName?:  string;
    paymentType?:  string;
    description?:  string;
}

export const getLessonTypeFullName = (shortCode: string | undefined, lessonShortcuts: LessonShortcut[]): string | null => {
    if (!shortCode) {
        return null;
    }

    const lessonType = lessonShortcuts.find(item => item.key.toLowerCase() === shortCode.toLowerCase());
    return lessonType ? lessonType.value : null;
};

export const parseExcel = async (file: File, lessonShortcuts: LessonShortcut[]): Promise<StudentPayment[]> => {
    try {
        const data = await readFileAsync(file);
        if (!data) {
            throw new Error('Failed to read file');
        }

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(data as ArrayBuffer);

        const worksheet = workbook.worksheets[0];
        const payments: StudentPayment[] = [];

        worksheet.eachRow((row, rowNumber) => {
            // Skip header row
            if (rowNumber === 1) {
                return;
            }

            const rowValues = row.values as any[];

            payments.push({
                studentName:   rowValues[1],
                type:          getLessonTypeFullName(rowValues[2], lessonShortcuts),
                group:         rowValues[3],
                teacherName:   rowValues[4],
                operationDate: rowValues[5] || null,
                incomeAmount:  rowValues[6] || 0,
                paymentType:   rowValues[7],
                expenseAmount: rowValues[8] || 0,
                description:   rowValues[9],
            });
        });

        console.log(payments.map((row) => row.operationDate));

        return payments;
    }
    catch (error) {
        console.log('Error parsing excel file:', error);
        throw error;
    }
};
