"use client";

import { PDFViewer } from "@react-pdf/renderer";
import { useMemo } from "react";
import { useDebounce } from "use-debounce";
import { ResumeTemplate } from "./resume-template";
import type { ResumeData } from "@/lib/types/resume";

interface PDFViewerClientProps {
  data: ResumeData;
}

export function PDFViewerClient({ data }: PDFViewerClientProps) {
  const [debouncedData] = useDebounce(data, 500);

  const document = useMemo(
    () => <ResumeTemplate data={debouncedData} />,
    [debouncedData]
  );

  // Stable key forces PDFViewer remount on data changes.
  // This works around a known react-pdf bug where dynamic content changes
  // cause "Eo is not a function" errors.
  // Note: JSON.stringify on resume data (~50KB max) is acceptable;
  // more complex hashing would add unnecessary complexity.
  const viewerKey = JSON.stringify(debouncedData);

  return (
    <PDFViewer
      key={viewerKey}
      style={{
        width: "100%",
        height: "calc(100vh - 180px)",
        border: "none",
      }}
      showToolbar={false}
    >
      {document}
    </PDFViewer>
  );
}
