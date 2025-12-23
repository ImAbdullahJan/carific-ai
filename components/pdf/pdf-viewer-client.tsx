"use client";

import { useState, useEffect, useRef } from "react";
import { pdf } from "@react-pdf/renderer";
import { Document, Page, pdfjs } from "react-pdf";
import { useDebounce } from "use-debounce";
import { Loader2, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ButtonGroup } from "@/components/ui/button-group";
import { ResumeTemplate } from "./resume-template";
import type { ResumeData } from "@/lib/types/resume";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerClientProps {
  data: ResumeData;
}

export function PDFViewerClient({ data }: PDFViewerClientProps) {
  const [debouncedData] = useDebounce(data, 300);

  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [previousPdfUrl, setPreviousPdfUrl] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [numPages, setNumPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(0.75);

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(600);

  const pdfUrlRef = useRef<string | null>(null);
  const previousPdfUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        setContainerWidth(Math.max(width - 40, 400));
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    const currentPdfUrl = pdfUrlRef.current;
    const currentPreviousPdfUrl = previousPdfUrlRef.current;
    return () => {
      if (currentPdfUrl) {
        URL.revokeObjectURL(currentPdfUrl);
      }
      if (currentPreviousPdfUrl) {
        URL.revokeObjectURL(currentPreviousPdfUrl);
      }
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    let generatedUrl: string | null = null;
    let urlSetToState = false;

    const generatePdf = async () => {
      setIsRendering(true);
      setError(null);

      try {
        const blob = await pdf(
          <ResumeTemplate data={debouncedData} />
        ).toBlob();
        const objectUrl = URL.createObjectURL(blob);
        generatedUrl = objectUrl;

        if (!cancelled) {
          urlSetToState = true;
          setPdfUrl(() => {
            pdfUrlRef.current = objectUrl;
            return objectUrl;
          });
        } else {
          URL.revokeObjectURL(objectUrl);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("PDF generation error:", err);
          setError(
            err instanceof Error ? err.message : "Failed to generate PDF"
          );
          setIsRendering(false);
        }
      }
    };

    generatePdf();

    return () => {
      cancelled = true;
      // Only revoke if URL was created but never set to state
      if (generatedUrl && !urlSetToState) {
        URL.revokeObjectURL(generatedUrl);
      }
    };
  }, [debouncedData]);

  const handleRenderSuccess = () => {
    setIsRendering(false);
    // Revoke previous URL after a delay to allow for transition
    if (previousPdfUrl && previousPdfUrl !== pdfUrl) {
      setTimeout(() => URL.revokeObjectURL(previousPdfUrl), 1000);
    }
    setPreviousPdfUrl(pdfUrl);
  };

  const handleDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setCurrentPage((prev) => Math.min(prev, numPages));
  };

  const handleDocumentLoadError = (err: Error) => {
    console.error("Document load error:", err);
    setError("Failed to load PDF document");
    setIsRendering(false);
  };

  const onPreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const onNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, numPages));
  };

  const onZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3));
  };

  const onZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5));
  };

  const onResetZoom = () => {
    setZoom(0.75);
  };

  const isFirstRender = !previousPdfUrl;
  const shouldShowTextLoader = isFirstRender && isRendering;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex flex-col items-center justify-center bg-muted/30"
    >
      {shouldShowTextLoader && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background z-1000 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Rendering PDF...</p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background z-1000 gap-3 p-5">
          <p className="text-sm text-destructive text-center">{error}</p>
        </div>
      )}

      {!error && (
        <div className="flex-1 relative w-full overflow-auto p-5 flex">
          <div
            className="relative m-auto shadow-2xl bg-white"
            style={{
              width: containerWidth * zoom,
              minHeight: containerWidth * zoom * 1.41, // Aspect ratio for A4
            }}
          >
            {/* Previous Document (Fading Out) */}
            {previousPdfUrl && previousPdfUrl !== pdfUrl && (
              <div
                className={cn(
                  "transition-opacity duration-300 ease-in-out absolute inset-0 z-0",
                  isRendering ? "opacity-100" : "opacity-0"
                )}
              >
                <Document file={previousPdfUrl} loading={null} error={null}>
                  <Page
                    pageNumber={currentPage}
                    width={containerWidth * zoom}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                  />
                </Document>
              </div>
            )}

            {/* Current/New Document */}
            {pdfUrl && (
              <div
                className={cn(
                  "transition-opacity duration-300 ease-in-out relative z-10",
                  isRendering && previousPdfUrl ? "opacity-0" : "opacity-100"
                )}
              >
                <Document
                  file={pdfUrl}
                  loading={null}
                  error={null}
                  onLoadSuccess={handleDocumentLoadSuccess}
                  onLoadError={handleDocumentLoadError}
                >
                  <Page
                    pageNumber={currentPage}
                    width={containerWidth * zoom}
                    onRenderSuccess={handleRenderSuccess}
                    renderTextLayer={true}
                    renderAnnotationLayer={true}
                  />
                </Document>
              </div>
            )}
          </div>
        </div>
      )}

      {!error && (
        <div className="flex items-center justify-between h-16 px-5 gap-3 bg-background border-t w-full">
          <ButtonGroup>
            <Button
              onClick={onZoomOut}
              disabled={zoom <= 0.5}
              title="Zoom Out"
              variant="outline"
              size="icon-sm"
            >
              <ZoomOut />
            </Button>

            <div className="flex items-center justify-center px-3 text-sm font-medium border-y bg-background min-w-[60px]">
              {Math.round(zoom * 100)}%
            </div>

            <Button
              onClick={onZoomIn}
              disabled={zoom >= 3}
              title="Zoom In"
              variant="outline"
              size="icon-sm"
            >
              <ZoomIn />
            </Button>

            <Button
              onClick={onResetZoom}
              disabled={zoom === 0.75}
              title="Reset Zoom"
              variant="outline"
              size="icon-sm"
            >
              <RotateCcw />
            </Button>
          </ButtonGroup>

          {numPages > 1 && (
            <ButtonGroup>
              <Button
                onClick={onPreviousPage}
                disabled={currentPage === 1}
                variant="outline"
                size="sm"
              >
                ← Previous
              </Button>

              <div className="flex items-center justify-center px-3 text-sm font-medium border-y bg-background">
                Page {currentPage} / {numPages}
              </div>

              <Button
                onClick={onNextPage}
                disabled={currentPage >= numPages}
                variant="outline"
                size="sm"
              >
                Next →
              </Button>
            </ButtonGroup>
          )}
        </div>
      )}
    </div>
  );
}
