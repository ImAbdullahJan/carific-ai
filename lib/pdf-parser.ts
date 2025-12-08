"use client";

import {
  GlobalWorkerOptions,
  getDocument,
} from "pdfjs-dist/legacy/build/pdf.mjs";
import type { TextContent, TextItem } from "pdfjs-dist/types/src/display/api";

// Set up the worker
GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

export interface PDFExtractResult {
  text: string;
  pageCount: number;
}

// Limits to prevent browser tab from freezing
const MAX_PAGES = 50;
const MAX_TEXT_LENGTH = 100_000;

/**
 * Merges text content items into a single string, preserving line breaks
 */
const mergeTextContent = (textContent: TextContent): string => {
  return textContent.items
    .map((item) => {
      const { str, hasEOL } = item as TextItem;
      return str + (hasEOL ? "\n" : "");
    })
    .join("");
};

/**
 * Extracts text content from a PDF file
 */
export const extractTextFromPDF = async (
  file: File
): Promise<PDFExtractResult> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await getDocument({ data: arrayBuffer }).promise;
    const pageCount = pdfDoc.numPages;

    if (pageCount > MAX_PAGES) {
      throw new Error(
        `PDF has ${pageCount} pages. Maximum allowed is ${MAX_PAGES} pages.`
      );
    }

    const pageTexts: string[] = [];
    let totalLength = 0;

    for (let i = 1; i <= pageCount; i++) {
      const page = await pdfDoc.getPage(i);
      const content = await page.getTextContent();
      const pageText = mergeTextContent(content).trim();

      totalLength += pageText.length;
      if (totalLength > MAX_TEXT_LENGTH) {
        throw new Error(
          `PDF content exceeds maximum allowed length. Please use a shorter resume.`
        );
      }

      pageTexts.push(pageText);
    }

    return {
      text: pageTexts.join("\n\n"),
      pageCount,
    };
  } catch (error) {
    console.error("Error parsing PDF:", error);
    if (error instanceof Error && error.message.includes("PDF")) {
      throw error;
    }
    throw new Error(
      "Failed to parse PDF. Please try a different file or paste your resume text directly."
    );
  }
};
