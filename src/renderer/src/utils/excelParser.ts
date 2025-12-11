import * as XLSX from 'xlsx';
import { readFileAsync } from './files';
import { LESSON_TYPE_MAP } from '../constants';

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

export const getLessonTypeFullName = (shortCode: string): string | null => {
    return LESSON_TYPE_MAP[shortCode] || null;
};

export const parseExcel = async (file: File): Promise<StudentPayment[]> => {
    try {
        const data = await readFileAsync(file);
        const workbook = XLSX.read(data, { type: 'binary', cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Remove header row
        json.shift();

        const payments: StudentPayment[] = json.map((row) => ({
            studentName:   row[0],
            type:          row[1] ? getLessonTypeFullName(row[1]) : null,
            group:         row[2],
            teacherName:   row[3],
            operationDate: row[4] || null,
            incomeAmount:  row[5] || 0,
            paymentType:   row[6],
            expenseAmount: row[7] || 0,
            description:   row[8],
        }));

        return payments;
    }
    catch (error) {
        console.log('Error parsing excel file:', error);
        throw error;
    }
};
