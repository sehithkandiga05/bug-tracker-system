const { Parser } = require('json2csv');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

/**
 * Generate CSV String
 */
const exportToCSV = (bugs) => {
  const fields = ['_id', 'title', 'category', 'priority', 'severity', 'status', 'createdAt'];
  const json2csvParser = new Parser({ fields });
  return json2csvParser.parse(bugs);
};

/**
 * Generate Excel Buffer
 */
const exportToExcel = async (bugs) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Bugs Log');

  worksheet.columns = [
    { header: 'ID', key: '_id', width: 25 },
    { header: 'Title', key: 'title', width: 35 },
    { header: 'Category', key: 'category', width: 15 },
    { header: 'Priority', key: 'priority', width: 12 },
    { header: 'Severity', key: 'severity', width: 12 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Environment', key: 'environment', width: 15 },
    { header: 'Created At', key: 'createdAt', width: 20 },
  ];

  bugs.forEach((bug) => {
    worksheet.addRow({
      _id: bug._id.toString(),
      title: bug.title,
      category: bug.category,
      priority: bug.priority,
      severity: bug.severity,
      status: bug.status,
      environment: bug.environment || 'Production',
      createdAt: bug.createdAt ? new Date(bug.createdAt).toLocaleDateString() : '',
    });
  });

  // Apply styling header
  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '1E293B' },
  };

  return await workbook.xlsx.writeBuffer();
};

/**
 * Stream PDF Document
 */
const exportToPDF = (bugs, res) => {
  const doc = new PDFDocument({ margin: 30, size: 'A4' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="bugs_report.pdf"');

  doc.pipe(res);

  // Title Header
  doc.fillColor('#0f172a').fontSize(20).text('Bug Tracking Automation System', { align: 'center' });
  doc.fontSize(12).fillColor('#64748b').text('Generated Bugs Report & Analytics Summary', { align: 'center' });
  doc.moveDown(1.5);

  // Summary metadata
  doc.fontSize(10).fillColor('#1e293b').text(`Total Bugs Logged: ${bugs.length}`);
  doc.text(`Export Date: ${new Date().toLocaleString()}`);
  doc.moveDown(1);

  doc.strokeColor('#cbd5e1').lineWidth(1).moveTo(30, doc.y).lineTo(565, doc.y).stroke();
  doc.moveDown(1);

  // Loop bugs
  bugs.forEach((bug, idx) => {
    if (doc.y > 700) {
      doc.addPage();
    }
    doc.fillColor('#1e293b').fontSize(12).text(`${idx + 1}. [${bug.priority}] ${bug.title}`, { underline: true });
    doc.fontSize(9).fillColor('#475569');
    doc.text(`Category: ${bug.category} | Status: ${bug.status} | Severity: ${bug.severity}`);
    doc.text(`Description: ${(bug.description || '').substring(0, 120)}...`);
    doc.moveDown(0.8);
  });

  doc.end();
};

module.exports = { exportToCSV, exportToExcel, exportToPDF };
