import type { Workbook } from '@zurmokeeper/exceljs';

declare global {
    interface Window {
        api: {
            pickFile: (extensions: string[]) => Promise<string | null>;
            readExcelWithPassword: (filePath: string, password?: string) => Promise<any>;
        };
    }
}
