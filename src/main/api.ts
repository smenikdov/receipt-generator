import { dialog } from 'electron';
import * as ExcelJS from '@zurmokeeper/exceljs';

export const api = {
    pickFile: async (extensions: string[]): Promise<string | null> => {
        const { canceled, filePaths } = await dialog.showOpenDialog({
            properties: ['openFile'],
            filters: [{ name: 'Excel Files', extensions }],
        });

        if (canceled) {
            return null;
        } else {
            return filePaths[0];
        }
    },

    readExcelWithPassword: async (filePath: string) => {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(filePath, { password: '1234' });
        const worksheet = workbook.worksheets[0];
        const rows: any = [];
        worksheet.eachRow((row) => rows.push(row.values));

        return rows;
    },
};

export type Api = typeof api;
