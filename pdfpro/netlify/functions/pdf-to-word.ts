import type { Handler, HandlerEvent } from "@netlify/functions";
import { PDFParse } from "pdf-parse";
import { Document, Packer, Paragraph, TextRun, PageBreak } from "docx";

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4 MB (Netlify request body limit is ~6 MB; base64 adds ~33%)

export const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const { fileBase64, filename } = body as {
      fileBase64: string;
      filename: string;
    };

    if (!fileBase64) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "No file provided" }),
      };
    }

    const buffer = Buffer.from(fileBase64, "base64");

    if (buffer.length > MAX_FILE_SIZE) {
      return {
        statusCode: 413,
        body: JSON.stringify({
          error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024} MB for serverless conversion.`,
        }),
      };
    }

    // Extract text from PDF using pdf-parse v2 class-based API
    const parser = new PDFParse({ data: new Uint8Array(buffer) });
    const textResult = await parser.getText();
    await parser.destroy();

    // Build DOCX with per-page structure
    const paragraphs: Paragraph[] = [];

    for (let i = 0; i < textResult.pages.length; i++) {
      const page = textResult.pages[i];

      // Add page break before each page after the first
      if (i > 0) {
        paragraphs.push(
          new Paragraph({
            children: [new PageBreak()],
          }),
        );
      }

      // Split page text into paragraph blocks
      const blocks = page.text
        .split(/\n{2,}/)
        .map((b) => b.trim())
        .filter((b) => b.length > 0);

      for (const block of blocks) {
        const lines = block
          .split("\n")
          .map((l) => l.trim())
          .filter((l) => l.length > 0);

        const children: TextRun[] = [];
        for (let j = 0; j < lines.length; j++) {
          if (j > 0) {
            children.push(new TextRun({ break: 1, text: "" }));
          }
          children.push(new TextRun({ text: lines[j] }));
        }

        paragraphs.push(new Paragraph({ children }));
      }
    }

    // Handle PDFs with no extractable text (e.g. scanned images)
    if (paragraphs.length === 0) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "No extractable text found in this PDF. The document may contain only images or scanned content.",
              italics: true,
            }),
          ],
        }),
      );
    }

    const doc = new Document({
      sections: [{ children: paragraphs }],
    });

    const docxBuffer = await Packer.toBuffer(doc);
    const outputFilename =
      filename?.replace(/\.pdf$/i, ".docx") ?? "converted.docx";

    return {
      statusCode: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${outputFilename}"`,
      },
      body: docxBuffer.toString("base64"),
      isBase64Encoded: true,
    };
  } catch (error: any) {
    console.error("PDF to Word conversion error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Conversion failed",
        details: error.message,
      }),
    };
  }
};
