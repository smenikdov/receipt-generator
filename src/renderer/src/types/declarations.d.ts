declare module '*.ttf';

declare global {
    interface Window {
        api: {
            showOpenDialog: () => Promise<string | null>;
            readExcelWithPassword: () => Promise<any>;
        };
    }
}
