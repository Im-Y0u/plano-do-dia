import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";

export async function generatePDF(
  elementId: string,
  filename: string = "plano_do_dia.pdf"
): Promise<void> {
  const el = document.getElementById(elementId);
  if (!el) throw new Error("Element not found");

  const canvas = await html2canvas(el, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: "#f5f5f0",
  });

  const imgData = canvas.toDataURL("image/png");
  const imgWidth = 210;
  const pageHeight = 297;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  const pdf = new jsPDF("p", "mm", "a4");
  pdf.addImage(imgData, "PNG", 0, 0, imgWidth, Math.min(imgHeight, pageHeight));

  if (imgHeight > pageHeight) {
    let remainingHeight = imgHeight - pageHeight;
    let position = -pageHeight;
    while (remainingHeight > 0) {
      position -= pageHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      remainingHeight -= pageHeight;
    }
  }

  pdf.save(filename);
}