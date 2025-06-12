import PDFDocument from "pdfkit";
import { format } from "date-fns";

interface InvoiceData {
  customerName: string;
  customerEmail: string;
  subscriptionId: string;
  planName: string;
  amount: number;
  currency: string;
  date: Date;
  status: string;
}

export async function generateInvoicePDF(data: InvoiceData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const chunks: Buffer[] = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      // Header
      doc
        .fontSize(20)
        .text("Qurieus", { align: "right" })
        .fontSize(10)
        .text("Invoice", { align: "right" })
        .moveDown();

      // Invoice Details
      doc
        .fontSize(12)
        .text(`Invoice Number: ${data.subscriptionId}`)
        .text(`Date: ${format(data.date, "PPP")}`)
        .text(`Status: ${data.status}`)
        .moveDown();

      // Customer Details
      doc
        .text("Bill To:")
        .text(data.customerName)
        .text(data.customerEmail)
        .moveDown();

      // Items
      doc
        .fontSize(12)
        .text("Items", { underline: true })
        .moveDown();

      // Table Header
      doc
        .fontSize(10)
        .text("Description", 50, doc.y, { width: 300 })
        .text("Amount", 350, doc.y, { width: 100, align: "right" });

      // Table Row
      doc
        .moveDown()
        .text(data.planName, 50, doc.y, { width: 300 })
        .text(
          `${data.currency} ${data.amount.toFixed(2)}`,
          350,
          doc.y,
          { width: 100, align: "right" }
        );

      // Total
      doc
        .moveDown(2)
        .fontSize(12)
        .text(
          `Total: ${data.currency} ${data.amount.toFixed(2)}`,
          { align: "right" }
        );

      // Footer
      doc
        .moveDown(4)
        .fontSize(10)
        .text(
          "Thank you for your business!",
          { align: "center" }
        );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
} 