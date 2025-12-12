import JSZip from 'jszip';
import { pdf } from '@react-pdf/renderer';
import type { DocumentProps } from '@react-pdf/renderer';
import React from 'react';

type PDFDocumentElement = React.ReactElement<DocumentProps>;

const documentToBlob = async (docElement: React.ReactElement): Promise<Blob> => {
    const instance = pdf();
    instance.updateContainer(docElement);
    const blob = await instance.toBlob();
    return blob;
};

export const createZip = async (documents: { fileName: string; document: PDFDocumentElement }[]): Promise<Blob> => {
    const zip = new JSZip();

    await Promise.allSettled(documents.map(async ({ fileName, document }) => {
        const blob = await documentToBlob(document);
        zip.file(fileName, blob);
    }));

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    return zipBlob;
};
