import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import type { Response } from 'express';

export function exportarExcel(res: Response, nombreArchivo: string, columnas: { header: string; key: string; width?: number }[], filas: Record<string, unknown>[]): void {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Sistema Academico Universitario';
  const hoja = workbook.addWorksheet('Reporte');
  hoja.columns = columnas.map((c) => ({ header: c.header, key: c.key, width: c.width ?? 22 }));
  hoja.getRow(1).font = { bold: true };
  hoja.addRows(filas);

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo}.xlsx"`);

  workbook.xlsx.write(res).then(() => res.end());
}

export function exportarPdf(res: Response, titulo: string, nombreArchivo: string, columnas: { header: string; key: string }[], filas: Record<string, unknown>[]): void {
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo}.pdf"`);

  const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });
  doc.pipe(res);

  doc.fontSize(16).text('Sistema Academico Universitario', { align: 'center' });
  doc.fontSize(12).text(titulo, { align: 'center' });
  doc.moveDown();
  doc.fontSize(9).text(`Generado: ${new Date().toLocaleString('es-CO')}`, { align: 'right' });
  doc.moveDown();

  const anchoColumna = (doc.page.width - 80) / columnas.length;
  let y = doc.y;

  doc.font('Helvetica-Bold');
  columnas.forEach((col, i) => {
    doc.text(col.header, 40 + i * anchoColumna, y, { width: anchoColumna, ellipsis: true });
  });
  doc.font('Helvetica');
  y += 18;
  doc.moveTo(40, y - 4).lineTo(doc.page.width - 40, y - 4).stroke();

  for (const fila of filas) {
    if (y > doc.page.height - 60) {
      doc.addPage({ margin: 40, size: 'A4', layout: 'landscape' });
      y = 40;
    }
    columnas.forEach((col, i) => {
      doc.text(String(fila[col.key] ?? ''), 40 + i * anchoColumna, y, { width: anchoColumna, ellipsis: true });
    });
    y += 16;
  }

  doc.end();
}
