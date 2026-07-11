import type { ExportTable } from './export';
import { toCsv, toXlsx } from './export';

const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

// Browser-side file save. Kept out of the pure export module so that stays
// testable in a node environment without DOM.
const triggerDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = url;
    anchor.download = filename;
    anchor.click();

    URL.revokeObjectURL(url);
};

export const downloadCsv = (table: ExportTable, filename: string) => {
    triggerDownload(new Blob([toCsv(table)], { type: 'text/csv;charset=utf-8' }), filename);
};

export const downloadXlsx = (table: ExportTable, filename: string) => {
    triggerDownload(new Blob([toXlsx(table) as BlobPart], { type: XLSX_MIME }), filename);
};
