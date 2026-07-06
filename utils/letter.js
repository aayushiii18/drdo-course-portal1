const PDFDocument = require('pdfkit');

function generateLetter(res, application, course, lab) {
  const doc = new PDFDocument({ margin: 50 });

  // Tell the browser this response is a PDF
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'inline; filename="letter.pdf"');

  // Stream the PDF content directly into the response
  doc.pipe(res);

  doc.fontSize(16).text('DEFENCE RESEARCH & DEVELOPMENT ORGANISATION', { align: 'center' });
  doc.fontSize(10).text('Ministry of Defence, Government of India', { align: 'center' });
  doc.moveDown(2);

  doc.fontSize(12).text(`Dear ${application.name},`);
  doc.moveDown();
  doc.text(
    `This is to confirm your selection for the course "${course.title}", ` +
    `to be held at ${lab.name}, ${lab.address}, from ${course.start_date} to ${course.end_date}.`
  );
  doc.moveDown();
  doc.text(`Accommodation: ${application.accommodation}`);
  doc.moveDown(2);

  doc.text('Yours sincerely,');
  doc.text(course.course_director);
  doc.text(course.director_designation);

  doc.end(); // finalize the PDF
}

module.exports = { generateLetter };