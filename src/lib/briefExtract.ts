/**
 * Client-side brief extraction
 * -----------------------------------------------------------------------------
 * Pulls plain text out of the files students actually upload: PDFs first, then
 * DOCX, then plain text / markdown. Everything else falls back with a helpful
 * error rather than silently failing.
 *
 * Notes:
 *   - PDFs are parsed with pdfjs-dist in the browser (no data leaves the
 *     device at this step — only the extracted text is later sent to the
 *     server-side AI endpoint).
 *   - DOCX uses mammoth's browser build to pull raw text.
 *   - Upload paths lazy-load the parsers via dynamic import so the main
 *     bundle stays light for students who only paste text.
 */

/* ------------------------------- Public API ------------------------------ */

export type BriefFileKind = "pdf" | "docx" | "text" | "unsupported";

export interface ExtractedBrief {
  text: string;
  kind: BriefFileKind;
  filename: string;
  /** Useful for UI: pages for PDFs, null for other formats. */
  pageCount?: number;
}

const MAX_FILE_BYTES = 20 * 1024 * 1024; // 20 MB
const MAX_EXTRACTED_CHARS = 60_000;

export async function extractBriefFromFile(file: File): Promise<ExtractedBrief> {
  if (file.size > MAX_FILE_BYTES) {
    throw new Error(
      `File is too large (${formatBytes(file.size)}). Keep assignment briefs under ${formatBytes(
        MAX_FILE_BYTES,
      )}.`,
    );
  }

  const kind = detectKind(file);
  if (kind === "unsupported") {
    throw new Error(
      `Unsupported file type: ${file.type || file.name}. Upload a PDF, DOCX, or plain-text brief.`,
    );
  }

  let result: ExtractedBrief;
  switch (kind) {
    case "pdf":
      result = await extractPdf(file);
      break;
    case "docx":
      result = await extractDocx(file);
      break;
    case "text":
      result = await extractText(file);
      break;
  }

  result.text = normaliseWhitespace(result.text).slice(0, MAX_EXTRACTED_CHARS);
  if (result.text.trim().length < 20) {
    throw new Error(
      "The file didn't contain enough readable text. If it's a scanned PDF, export a text copy from your LMS or paste the brief directly.",
    );
  }
  return result;
}

/* ------------------------------- Internals ------------------------------- */

function detectKind(file: File): BriefFileKind {
  const name = file.name.toLowerCase();
  const type = (file.type || "").toLowerCase();
  if (type === "application/pdf" || name.endsWith(".pdf")) return "pdf";
  if (
    type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    name.endsWith(".docx")
  ) {
    return "docx";
  }
  if (
    type.startsWith("text/") ||
    name.endsWith(".txt") ||
    name.endsWith(".md") ||
    name.endsWith(".rtf")
  ) {
    return "text";
  }
  return "unsupported";
}

async function extractPdf(file: File): Promise<ExtractedBrief> {
  const [pdfjsLib, workerUrl] = await Promise.all([
    import("pdfjs-dist"),
    // Vite returns the worker asset URL — bundled correctly at build time.
    import("pdfjs-dist/build/pdf.worker.min.mjs?url").then((m) => m.default as string),
  ]);
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

  const buffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: buffer });
  const doc = await loadingTask.promise;

  const pageTexts: string[] = [];
  for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
    const page = await doc.getPage(pageNum);
    const textContent = await page.getTextContent();
    const line = textContent.items
      .map((item) => {
        // `str` exists on PDFjs TextItem; TextMarkedContent has no visible text.
        const maybe = item as { str?: string };
        return maybe.str ?? "";
      })
      .join(" ");
    pageTexts.push(line);
    // Safety — very large PDFs don't need to be parsed in their entirety.
    if (pageTexts.join("\n").length > MAX_EXTRACTED_CHARS * 1.2) break;
  }

  await doc.destroy();

  return {
    text: pageTexts.join("\n\n"),
    kind: "pdf",
    filename: file.name,
    pageCount: doc.numPages,
  };
}

async function extractDocx(file: File): Promise<ExtractedBrief> {
  const mammoth = await import("mammoth/mammoth.browser");
  const buffer = await file.arrayBuffer();
  const { value } = await mammoth.extractRawText({ arrayBuffer: buffer });
  return {
    text: value ?? "",
    kind: "docx",
    filename: file.name,
  };
}

async function extractText(file: File): Promise<ExtractedBrief> {
  const text = await file.text();
  return { text, kind: "text", filename: file.name };
}

function normaliseWhitespace(text: string): string {
  return text
    .replace(/\r\n?/g, "\n")
    // Collapse long whitespace runs but preserve blank lines / structure.
    .replace(/[^\S\n]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
