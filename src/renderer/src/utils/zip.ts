import JSZip from 'jszip';
import { pdf } from '@react-pdf/renderer';
import type { DocumentProps } from '@react-pdf/renderer';
import React from 'react';

type PDFDocumentElement = React.ReactElement<DocumentProps>;

export const createZip = async (documents: { fileName: string; document: PDFDocumentElement }[]): Promise<Blob> => {
    const zip = new JSZip();

    for (const { fileName, document } of documents) {
        const blob = await pdf(document).toBlob();
        zip.file(fileName, blob);
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    return zipBlob;
};
